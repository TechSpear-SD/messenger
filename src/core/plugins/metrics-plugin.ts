import { EventBus } from '../bus/event-bus';
import { EventNames } from '../bus/event-names';
import { EventPayloads } from '../bus/event-payloads';
import { Plugin } from './plugin';
import { contextLogger, getContextNoLogger } from '../context';
import prisma from '../../prisma';

export class MetricsPlugin extends Plugin {
    constructor(bus: EventBus<EventPayloads>) {
        super(bus);
    }

    registerListeners(): void {
        /**
         * INFO METRICS
         * Générées lors d'événements "normaux" (exécution, transformation, rendu, etc.)
         */
        const infoMetrics: Partial<{
            [K in keyof EventPayloads]: (payload: EventPayloads[K]) => {
                name: string;
                value: number;
                unit?: string;
                type?: string;
                source?: string;
                severity?: string;
                category?: string;
                tags?: Record<string, any>;
                templateId?: string;
                providerId?: string;
                workerId?: string;
                scenarioId?: string;
            };
        }> = {
            /** -------------------- WORKER -------------------- */
            [EventNames.WorkerMessageReceived]: (p) => ({
                name: 'queue_message_received',
                value: 1,
                unit: 'count',
                type: 'counter',
                source: 'worker',
                category: 'system',
                severity: 'info',
                workerId: p.workerId,
                tags: { ...getContextNoLogger() },
            }),
            [EventNames.WorkerMessageProcessed]: (p) => ({
                name: 'queue_message_processing_time_ms',
                value: p.durationMs,
                unit: 'ms',
                type: 'timer',
                source: 'worker',
                category: 'performance',
                severity: 'info',
                workerId: p.workerId,
                tags: { ...getContextNoLogger() },
            }),
            [EventNames.WorkerConnected]: (p) => ({
                name: 'worker_connected',
                value: 1,
                unit: 'count',
                type: 'counter',
                source: 'worker',
                category: 'system',
                severity: 'info',
                workerId: p.workerId,
                tags: { ...getContextNoLogger() },
            }),
            [EventNames.WorkerDisconnected]: (p) => ({
                name: 'worker_disconnected',
                value: 1,
                unit: 'count',
                type: 'counter',
                source: 'worker',
                category: 'system',
                severity: 'info',
                workerId: p.workerId,
                tags: { ...getContextNoLogger() },
            }),

            /** -------------------- SCENARIO -------------------- */
            [EventNames.ScenarioBeforeExecute]: (p) => ({
                name: 'scenario_execution_start',
                value: 1,
                type: 'counter',
                source: 'scenario',
                category: 'business',
                severity: 'info',
                scenarioId: p.scenarioId,
                tags: { ...getContextNoLogger() },
            }),
            [EventNames.ScenarioAfterExecute]: (p) => ({
                name: 'scenario_execution_time_ms',
                value: p.durationMs ?? 0,
                unit: 'ms',
                type: 'timer',
                source: 'scenario',
                category: 'business',
                severity: 'info',
                scenarioId: p.scenarioId,
                tags: { ...getContextNoLogger() },
            }),

            /** -------------------- TEMPLATE -------------------- */
            [EventNames.TemplateBeforeTransform]: (p) => ({
                name: 'template_transform_start',
                value: 1,
                type: 'counter',
                source: 'template',
                category: 'performance',
                severity: 'info',
                templateId: p.templateId,
                tags: { ...getContextNoLogger() },
            }),
            [EventNames.TemplateAfterTransform]: (p) => ({
                name: 'template_transform_time_ms',
                value: p.durationMs ?? 0,
                unit: 'ms',
                type: 'timer',
                source: 'template',
                category: 'performance',
                severity: 'info',
                templateId: p.templateId,
                tags: { ...getContextNoLogger() },
            }),
            [EventNames.TemplateAfterRender]: (p) => ({
                name: 'template_render_time_ms',
                value: p.durationMs ?? 0,
                unit: 'ms',
                type: 'timer',
                source: 'template',
                category: 'performance',
                severity: 'info',
                templateId: p.templateId,
                tags: { ...getContextNoLogger() },
            }),

            /** -------------------- PROVIDER -------------------- */
            [EventNames.ProviderBeforeSend]: (p) => ({
                name: 'provider_send_start',
                value: 1,
                unit: 'count',
                type: 'counter',
                source: 'provider',
                category: 'delivery',
                severity: 'info',
                providerId: p.providerId,
                tags: { ...getContextNoLogger() },
            }),
            [EventNames.ProviderAfterSend]: (p) => ({
                name: 'provider_send_time_ms',
                value: p.response.durationMs ?? 0,
                unit: 'ms',
                type: 'timer',
                source: 'provider',
                category: 'delivery',
                severity: 'info',
                providerId: p.providerId,
                tags: { ...getContextNoLogger() },
            }),
        };

        /**
         * ERROR METRICS
         * Générées lors d'échecs ou d'exceptions
         */
        const errorMetrics: Partial<{
            [K in keyof EventPayloads]: (payload: EventPayloads[K]) => {
                name: string;
                value: number;
                unit?: string;
                type?: string;
                source?: string;
                severity?: string;
                category?: string;
                tags?: Record<string, any>;
                templateId?: string;
                providerId?: string;
                workerId?: string;
                scenarioId?: string;
            };
        }> = {
            [EventNames.TemplateError]: (p) => ({
                name: 'template_error_count',
                value: 1,
                type: 'counter',
                source: 'template',
                severity: 'error',
                category: 'error',
                templateId: (p as any)?.templateId,
                tags: { message: (p as any)?.message, ...getContextNoLogger() },
            }),
            [EventNames.TemplateRenderError]: (p) => ({
                name: 'template_render_error_count',
                value: 1,
                type: 'counter',
                source: 'template',
                severity: 'error',
                category: 'error',
                templateId: (p as any)?.templateId,
                tags: { message: (p as any)?.message, ...getContextNoLogger() },
            }),
            [EventNames.ProviderError]: (p) => ({
                name: 'provider_error_count',
                value: 1,
                type: 'counter',
                source: 'provider',
                severity: 'error',
                category: 'error',
                providerId: (p as any)?.providerId,
                tags: { message: (p as any)?.message, ...getContextNoLogger() },
            }),
            [EventNames.SystemError]: (p) => ({
                name: 'system_error_count',
                value: 1,
                type: 'counter',
                source: 'system',
                severity: 'error',
                category: 'system',
                tags: { message: (p as any)?.message, ...getContextNoLogger() },
            }),
        };

        /**
         * Enregistrement des listeners
         */
        for (const [eventName, metricFn] of Object.entries(infoMetrics) as [
            keyof EventPayloads,
            (payload: any) => any,
        ][]) {
            if (!metricFn) continue;
            this.bus.on(eventName, async (payload: any) => {
                const metric = metricFn(payload);
                try {
                    await prisma.metric.create({ data: metric });
                } catch (err: any) {
                    contextLogger.error(
                        `[MetricsPlugin] Failed to save metric ${metric.name}`,
                        err,
                    );
                }
            });
        }

        for (const [eventName, metricFn] of Object.entries(errorMetrics) as [
            keyof EventPayloads,
            (payload: any) => any,
        ][]) {
            if (!metricFn) continue;
            this.bus.on(eventName, async (payload: any) => {
                const metric = metricFn(payload);
                try {
                    await prisma.metric.create({ data: metric });
                } catch (err: any) {
                    contextLogger.error(
                        `[MetricsPlugin] Failed to save error metric ${metric.name}`,
                        err,
                    );
                }
            });
        }
    }
}
