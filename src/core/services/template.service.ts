import { config, TemplateConfig } from '../../config';
import pinoLogger from '../../logger';
import { DataTransform } from '../../transforms/transform.type';
import { getContext } from '../context';
import { ProviderExecutionContext } from '../entities/provider-execution-ctx';
import { TemplateExecutionContext } from '../entities/template-execution-ctx';
import { ProviderService } from './provider.service';
import { TemplateRenderer } from './template-renderer';

export class TemplateService {
    static async getById(templateId: string) {
        return (
            config.templates.find((t) => t.templateId === templateId) || null
        );
    }

    static async execute(ctx: TemplateExecutionContext): Promise<void> {
        const logger = getContext()?.logger || pinoLogger;
        const template = await TemplateService.getById(ctx.templateId);
        if (!template) throw new Error(`Template not found: ${ctx.templateId}`);

        logger.info({ templateId: ctx.templateId }, 'Executing template');

        let transformedData = await this.applyTemplateTransform(
            template,
            ctx.businessData,
        );

        const { subject, body } = await TemplateRenderer.render(
            template.path,
            transformedData,
        );

        const provider = ProviderService.getById(template.providerId);
        if (!provider) {
            throw new Error(`Provider not found: ${template.providerId}`);
        }

        const payload: ProviderExecutionContext = {
            applicationId: ctx.applicationId,
            to: ctx.to,
            cc: ctx.cc,
            bcc: ctx.bcc,
            body: body || ctx.bodyOverride || 'Empty body',
            subject: subject || ctx.subject || 'Undefined subject',
            meta: ctx.meta,
            tracking: ctx.tracking,
        };

        await provider.send(payload);

        logger.info(
            { provider: template.providerId, templateId: ctx.templateId },
            'Template sent successfully',
        );
    }

    static async applyTemplateTransform(template: TemplateConfig, data: any) {
        if (
            !template.dataTransformFiles ||
            template.dataTransformFiles.length === 0
        ) {
            return data;
        }

        for (const file of template.dataTransformFiles) {
            const mod = await import(`${config.transformsDir}/${file}`);
            const transform: DataTransform = mod.default;
            if (typeof transform !== 'function') {
                throw new Error(
                    `Transform in ${file} (template: ${template.templateId}) must export a default function`,
                );
            }

            try {
                data = await transform(data);
            } catch (err) {
                throw new Error(
                    `Error applying transform ${file} for template ${template.templateId}: ${(err as Error).message}`,
                );
            }
        }

        return data;
    }
}
