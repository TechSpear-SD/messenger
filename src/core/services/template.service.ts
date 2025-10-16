import { config, SupportedChannel, TemplateConfig } from '../../config';
import { AbstractProvider } from '../../providers/email/provider.interface';

import { DataTransform } from '../../transforms/transform.type';
import { bus } from '../bus';
import { EventNames } from '../bus/event-names';
import { ProviderExecutionContext } from '../entities/provider-execution-ctx';
import { TemplateExecutionContext } from '../entities/template-execution-ctx';
import { ProviderService } from './provider.service';
import { TemplateRenderer } from './template-renderer';

export class TemplateService {
    static async execute(ctx: TemplateExecutionContext): Promise<void> {
        bus.emit(EventNames.TemplateBeforeExecute, {
            templateId: ctx.templateId,
            data: ctx.businessData,
        });

        const template: TemplateConfig = await this.loadTemplate(
            ctx.templateId,
        );
        const transformedData = await this.transformData(
            template,
            ctx.businessData,
        );
        const rendered = await this.renderTemplate(
            template,
            transformedData,
            ctx,
        );
        const provider = await this.loadProvider(template.providerId);

        try {
            await this.sendWithProvider(
                provider,
                rendered,
                ctx,
                template.channels,
            );
        } catch (err: any) {
            bus.emit(EventNames.TemplateError, {
                templateId: ctx.templateId,
                error: err,
            });
            throw err;
        }

        bus.emit(EventNames.TemplateAfterExecute, {
            templateId: ctx.templateId,
            result: { providerId: template.providerId },
        });
    }

    private static async loadTemplate(
        templateId: string,
    ): Promise<TemplateConfig> {
        const template = config.templates.find(
            (t) => t.templateId === templateId,
        );
        if (!template) {
            throw new Error(`Template not found: ${templateId}`);
        }
        return template;
    }

    private static async transformData(
        template: TemplateConfig,
        data: any,
    ): Promise<any> {
        bus.emit(EventNames.TemplateBeforeTransform, {
            templateId: template.templateId,
            data,
        });

        const transformed = await this.applyTemplateTransform(template, data);

        bus.emit(EventNames.TemplateAfterTransform, {
            templateId: template.templateId,
            transformedData: transformed,
        });

        return transformed;
    }

    private static async renderTemplate(
        template: TemplateConfig,
        data: any,
        ctx: TemplateExecutionContext,
    ): Promise<{ subject: string; body: string }> {
        bus.emit(EventNames.TemplateBeforeRender, {
            templateId: template.templateId,
            context: ctx,
        });

        const rendered = await TemplateRenderer.render(template.path, data);

        const subject = rendered.subject || ctx.bodyOverride || 'Empty subject';
        const body = rendered.body || ctx.bodyOverride || 'Empty body';

        bus.emit(EventNames.TemplateAfterRender, {
            templateId: template.templateId,
            rendered: { subject, body },
            context: ctx,
        });

        return { subject, body };
    }

    private static async loadProvider(providerId: string) {
        const provider = ProviderService.getById(providerId);
        if (!provider) {
            throw new Error(`Provider not found: ${providerId}`);
        }
        return provider;
    }

    private static async sendWithProvider(
        provider: AbstractProvider,
        rendered: { subject: string; body: string },
        ctx: TemplateExecutionContext,
        channels: SupportedChannel[],
    ) {
        const payload: ProviderExecutionContext = {
            applicationId: ctx.applicationId,
            to: ctx.to,
            cc: ctx.cc,
            bcc: ctx.bcc,
            body: rendered.body,
            channels: channels,
            subject: rendered.subject,
            meta: ctx.meta,
            tracking: ctx.tracking,
        };
        const results = await provider.send(payload);

        if (results.every((r) => !r.success)) {
            throw new Error(
                `All channels failed for template ${ctx.templateId} with provider ${provider.id}`,
            );
        }

        return results;
    }

    static async applyTemplateTransform(template: TemplateConfig, data: any) {
        if (!template.dataTransformFiles?.length) {
            return data;
        }

        for (const file of template.dataTransformFiles) {
            const modulePath = `${config.transformsDir}/${file}`;
            const mod = await import(modulePath);
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
