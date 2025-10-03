import { config, TemplateConfig } from '../../config';
import { DataTransform } from '../../transforms/transform.type';

export class TemplateService {
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
