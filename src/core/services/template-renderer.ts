import fs from 'fs/promises';
import path from 'path';
import Handlebars from 'handlebars';
import pinoLogger from '../../logger';
import { config } from '../../config';

type RenderedTemplate = { subject?: string; body?: string };

export class TemplateRenderer {
    private static cache = new Map<string, HandlebarsTemplateDelegate>();

    static async render(
        templateDir: string,
        data: Record<string, any>,
    ): Promise<RenderedTemplate> {
        const subjectPath = path.join(
            config.templateDir,
            templateDir,
            'subject.hbs',
        );
        const bodyPath = path.join(config.templateDir, templateDir, 'body.hbs');

        const [subjectTemplate, bodyTemplate] = await Promise.all([
            this.loadTemplate(subjectPath),
            this.loadTemplate(bodyPath),
        ]);

        const subject = subjectTemplate ? subjectTemplate(data) : undefined; // You can add a subject.hbs file to your template folder. Or specify a subject in the business data.

        const body = bodyTemplate ? bodyTemplate(data) : undefined; // You can add a body.hbs file to your template folder. Or specify a body in the business data.

        return { subject, body };
    }

    private static async loadTemplate(
        filePath: string,
    ): Promise<HandlebarsTemplateDelegate | null> {
        if (this.cache.has(filePath)) {
            return this.cache.get(filePath)!;
        }

        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const compiled = Handlebars.compile(content);
            this.cache.set(filePath, compiled);
            return compiled;
        } catch (err: any) {
            if (err.code !== 'ENOENT') {
                pinoLogger.error(
                    { filePath, err },
                    '❌ Failed to load template',
                );
            }
            return null;
        }
    }
}
