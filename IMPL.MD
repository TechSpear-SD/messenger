# Guide d'implémentation - Messenger

Ce guide détaille comment étendre et développer dans le système Messenger. Il couvre l'ajout de nouveaux composants et les patterns d'architecture utilisés.

## 🏗️ Patterns d'architecture

### 1. Singleton Pattern - MessengerApp

L'application principale utilise le pattern Singleton pour garantir une seule instance :

```typescript
export class MessengerApp {
    private static instance: MessengerApp;

    public static getInstance(): MessengerApp {
        if (!MessengerApp.instance) {
            MessengerApp.instance = new MessengerApp();
        }
        return MessengerApp.instance;
    }
}
```

### 2. Factory Pattern - Providers et Workers

Les providers et workers utilisent le Factory pattern pour l'instanciation :

```typescript
export class ProviderFactory {
    static create(config: ProviderConfig): AbstractProvider {
        const providers: AbstractProvider[] = [new MockProvider()];
        const found = providers.find((p) => p.id === config.providerId);
        if (!found) {
            throw new Error(`Unknown provider: ${config.providerId}`);
        }
        return found;
    }
}
```

### 3. Observer Pattern - Event Bus

Communication découplée via un système d'événements typé :

```typescript
type EventPayloads = {
    [EventNames.TemplateBeforeExecute]: { templateId: string; data: any };
    [EventNames.ProviderAfterSend]: { providerId: string; response: any };
};

bus.emit(EventNames.TemplateBeforeExecute, { templateId, data });
```

### 4. Strategy Pattern - Providers

Différentes stratégies d'envoi encapsulées dans des providers :

```typescript
abstract class AbstractProvider {
    abstract readonly supportedChannels: SupportedChannel[];

    protected abstract sendByChannel(
        channel: SupportedChannel,
        message: ProviderExecutionContext,
    ): Promise<string | undefined>;
}
```

### 5. Template Method Pattern - BaseWorker

Structure commune avec points d'extension :

```typescript
abstract class BaseWorker {
    async handleMessage(message: QueueMessage): Promise<void> {
        // Logic commune
        await this.processMessage(message); // Hook pour classes dérivées
    }

    protected abstract processMessage(message: QueueMessage): Promise<void>;
}
```

## 🔧 Ajout de nouveaux composants

### 1. Ajouter un nouveau Provider

#### Étape 1 : Créer la classe Provider

```typescript
// src/providers/email/sendgrid-provider.ts
import { AbstractProvider } from './provider.interface';
import { SupportedChannel } from '../../config';
import { ProviderExecutionContext } from '../../core/entities/provider-execution-ctx';

export class SendGridProvider extends AbstractProvider {
    readonly id = 'sendgrid-provider';
    readonly supportedChannels: SupportedChannel[] = ['email'];

    protected async sendByChannel(
        channel: SupportedChannel,
        message: ProviderExecutionContext,
    ): Promise<string | undefined> {
        switch (channel) {
            case 'email':
                return await this.sendEmail(message);
            default:
                throw new Error(`Unsupported channel: ${channel}`);
        }
    }

    private async sendEmail(
        message: ProviderExecutionContext,
    ): Promise<string> {
        // Implémentation SendGrid
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const msg = {
            to: message.to,
            from: 'noreply@example.com',
            subject: message.subject,
            html: message.body,
        };

        const response = await sgMail.send(msg);
        return response[0].headers['x-message-id'];
    }
}
```

#### Étape 2 : Enregistrer dans la Factory

```typescript
// src/providers/provider-factory.ts
import { SendGridProvider } from './email/sendgrid-provider';

export class ProviderFactory {
    static create(config: ProviderConfig): AbstractProvider {
        const providers: AbstractProvider[] = [
            new MockProvider(),
            new SendGridProvider(), // Nouveau provider
        ];
        // ...
    }
}
```

#### Étape 3 : Ajouter la configuration

```typescript
// src/config/providers.ts
export const providersConfig: ProviderConfig[] = [
    {
        providerId: 'sendgrid-provider',
        name: 'SendGrid',
        description: 'SendGrid email provider',
    },
];
```

### 2. Ajouter un nouveau Worker

#### Étape 1 : Créer la classe Worker

```typescript
// src/workers/webhook-worker.ts
import { BaseWorker } from './base-worker';
import { QueueMessage } from '../core/entities/queue-message';
import { WorkerConfig } from '../config';

export class WebhookWorker extends BaseWorker {
    readonly id = 'webhook-worker';
    readonly workerConfig: WorkerConfig;

    constructor(workerConfig: WorkerConfig) {
        super();
        this.workerConfig = workerConfig;
    }

    protected async handleConnect(): Promise<void> {
        // Initialisation des connexions webhook
    }

    protected async handleSubscribe(): Promise<void> {
        // Souscription aux webhooks
    }

    protected async handleDisconnect(): Promise<void> {
        // Nettoyage des connexions
    }

    protected async processMessage(message: QueueMessage): Promise<void> {
        // Traitement spécifique aux webhooks
        await this.sendWebhook(message);
    }

    private async sendWebhook(message: QueueMessage): Promise<void> {
        // Implémentation webhook
    }
}
```

#### Étape 2 : Enregistrer dans la Factory

```typescript
// src/workers/worker-factory.ts
import { WebhookWorker } from './webhook-worker';

export class WorkerFactory {
    static create(config: WorkerConfig): BaseWorker {
        const workers: BaseWorker[] = [
            new GenericBullWorker(config),
            new WebhookWorker(config), // Nouveau worker
        ];
        // ...
    }
}
```

### 3. Ajouter un nouveau Plugin

#### Étape 1 : Créer la classe Plugin

```typescript
// src/core/plugins/metrics-plugin.ts
import { Plugin } from './plugin';
import { EventNames } from '../bus/event-names';

export class MetricsPlugin extends Plugin {
    private metrics = new Map<string, number>();

    registerListeners(): void {
        this.bus.on(EventNames.TemplateAfterExecute, (payload) => {
            this.incrementCounter(`template.${payload.templateId}.executed`);
        });

        this.bus.on(EventNames.ProviderAfterSend, (payload) => {
            this.incrementCounter(`provider.${payload.providerId}.sent`);
        });
    }

    private incrementCounter(key: string): void {
        const current = this.metrics.get(key) || 0;
        this.metrics.set(key, current + 1);
        this.getContextLogger().info(`Metric: ${key} = ${current + 1}`);
    }

    getMetrics(): Record<string, number> {
        return Object.fromEntries(this.metrics);
    }
}
```

#### Étape 2 : Enregistrer dans l'application

```typescript
// src/app.ts
import { MetricsPlugin } from './core/plugins/metrics-plugin';

export class MessengerApp {
    private registerPlugins() {
        this.pluginManager.register(LoggerPlugin);
        this.pluginManager.register(MetricsPlugin); // Nouveau plugin
    }
}
```

### 4. Ajouter une nouvelle transformation de données

#### Étape 1 : Créer le fichier de transformation

```typescript
// transforms/user-enrichment.ts
import { DataTransform } from '../src/transforms/transform.type';

const userEnrichment: DataTransform = async (data: any) => {
    return {
        ...data,
        // Enrichissement des données utilisateur
        fullName: `${data.firstName} ${data.lastName}`,
        registrationDate: new Date(data.createdAt).toLocaleDateString('fr-FR'),
        isNewUser: isUserNew(data.createdAt),
        // Ajout d'URLs dynamiques
        dashboardUrl: `${process.env.APP_URL}/dashboard?user=${data.userId}`,
        unsubscribeUrl: `${process.env.APP_URL}/unsubscribe?token=${data.unsubscribeToken}`,
    };
};

function isUserNew(createdAt: string): boolean {
    const created = new Date(createdAt);
    const now = new Date();
    const diffDays = (now.getTime() - created.getTime()) / (1000 * 3600 * 24);
    return diffDays <= 7; // Nouveau si inscrit il y a moins de 7 jours
}

export default userEnrichment;
```

#### Étape 2 : Référencer dans la configuration du template

```typescript
// src/config/templates.ts
export const templatesConfig: TemplateConfig[] = [
    {
        templateId: 'user_welcome_enriched',
        providerId: 'sendgrid-provider',
        path: 'user_welcome',
        channels: ['email'],
        dataTransformFiles: ['user-enrichment.ts'], // Nouvelle transformation
    },
];
```

### 5. Créer un nouveau template

#### Étape 1 : Créer les fichiers template

```handlebars
<!-- templates/order_confirmation/subject.hbs -->
{{#if orderNumber}}
    Confirmation de commande #{{orderNumber}}
{{else}}
    Confirmation de votre commande
{{/if}}
```

```handlebars
<!-- templates/order_confirmation/body.hbs -->
<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
    <h1>Merci pour votre commande !</h1>

    {{#if customerName}}
        <p>Bonjour {{customerName}},</p>
    {{else}}
        <p>Bonjour,</p>
    {{/if}}

    <p>Nous avons bien reçu votre commande
        {{#if orderNumber}}#{{orderNumber}}{{/if}}
        du
        {{formatDate orderDate}}.</p>

    <h2>Détails de la commande</h2>
    <table style='width: 100%; border-collapse: collapse;'>
        <thead>
            <tr style='background-color: #f5f5f5;'>
                <th style='padding: 10px; text-align: left;'>Produit</th>
                <th style='padding: 10px; text-align: right;'>Quantité</th>
                <th style='padding: 10px; text-align: right;'>Prix</th>
            </tr>
        </thead>
        <tbody>
            {{#each items}}
                <tr>
                    <td
                        style='padding: 10px; border-bottom: 1px solid #eee;'
                    >{{name}}</td>
                    <td
                        style='padding: 10px; border-bottom: 1px solid #eee; text-align: right;'
                    >{{quantity}}</td>
                    <td
                        style='padding: 10px; border-bottom: 1px solid #eee; text-align: right;'
                    >{{price}}€</td>
                </tr>
            {{/each}}
        </tbody>
        <tfoot>
            <tr style='font-weight: bold; background-color: #f9f9f9;'>
                <td colspan='2' style='padding: 10px; text-align: right;'>Total
                    :</td>
                <td
                    style='padding: 10px; text-align: right;'
                >{{totalAmount}}€</td>
            </tr>
        </tfoot>
    </table>

    {{#if trackingNumber}}
        <p style='margin-top: 20px;'>
            <strong>Numéro de suivi :</strong>
            {{trackingNumber}}<br />
            <a href='{{trackingUrl}}' style='color: #007cba;'>Suivre votre colis</a>
        </p>
    {{/if}}

    <p style='margin-top: 30px; color: #666; font-size: 14px;'>
        Si vous avez des questions, contactez-nous à
        <a href='mailto:{{supportEmail}}'>{{supportEmail}}</a>
    </p>
</div>
```

#### Étape 2 : Créer la transformation pour formater les données

```typescript
// transforms/order-formatting.ts
const orderFormatting: DataTransform = async (data: any) => {
    return {
        ...data,
        // Formatage des dates
        orderDate: new Date(data.orderDate).toLocaleDateString('fr-FR'),
        // Calcul du total si pas fourni
        totalAmount:
            data.totalAmount ||
            data.items.reduce(
                (sum: number, item: any) => sum + item.quantity * item.price,
                0,
            ),
        // Génération d'URL de tracking
        trackingUrl: data.trackingNumber
            ? `https://tracking.example.com/${data.trackingNumber}`
            : null,
    };
};

export default orderFormatting;
```

#### Étape 3 : Configurer le template

```typescript
// src/config/templates.ts
export const templatesConfig: TemplateConfig[] = [
    // ... autres templates
    {
        templateId: 'order_confirmation',
        providerId: 'sendgrid-provider',
        path: 'order_confirmation',
        channels: ['email'],
        dataTransformFiles: ['order-formatting.ts'],
        description: 'Confirmation de commande avec détails',
    },
];
```

#### Étape 4 : Créer le scénario associé

```typescript
// src/config/scenarios.ts
export const scenariosConfig: ScenarioConfig[] = [
    // ... autres scénarios
    {
        scenarioId: 'order_placed',
        description: 'Commande passée avec succès',
        templateIds: ['order_confirmation'],
    },
];
```

## 🔄 Helpers Handlebars personnalisés

### Ajout de helpers globaux

```typescript
// src/core/services/template-renderer.ts
import Handlebars from 'handlebars';

// Enregistrement de helpers personnalisés
Handlebars.registerHelper('formatDate', function (date: string) {
    return new Date(date).toLocaleDateString('fr-FR');
});

Handlebars.registerHelper('formatCurrency', function (amount: number) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
    }).format(amount);
});

Handlebars.registerHelper('uppercase', function (str: string) {
    return str.toUpperCase();
});

Handlebars.registerHelper('eq', function (a: any, b: any) {
    return a === b;
});

Handlebars.registerHelper('gt', function (a: number, b: number) {
    return a > b;
});
```

### Utilisation dans les templates

```handlebars
{{! Utilisation des helpers personnalisés }}
<p>Date de commande : {{formatDate orderDate}}</p>
<p>Montant : {{formatCurrency totalAmount}}</p>
<p>Code : {{uppercase orderCode}}</p>

{{#if (gt itemCount 1)}}
    <p>Vous avez commandé {{itemCount}} articles.</p>
{{/if}}

{{#eq status 'confirmed'}}
    <div class='confirmed'>Commande confirmée !</div>
{{/eq}}
```

## 📊 Monitoring et métriques

### Extension du système de métriques

```typescript
// src/core/plugins/advanced-metrics-plugin.ts
export class AdvancedMetricsPlugin extends Plugin {
    private startTimes = new Map<string, number>();

    registerListeners(): void {
        // Mesure de performance
        this.bus.on(EventNames.TemplateBeforeExecute, (payload) => {
            this.startTimes.set(payload.templateId, Date.now());
        });

        this.bus.on(EventNames.TemplateAfterExecute, (payload) => {
            const startTime = this.startTimes.get(payload.templateId);
            if (startTime) {
                const duration = Date.now() - startTime;
                this.recordMetric('template.execution.duration', duration, {
                    templateId: payload.templateId,
                });
                this.startTimes.delete(payload.templateId);
            }
        });

        // Comptage des erreurs
        this.bus.on(EventNames.TemplateError, (payload) => {
            this.incrementCounter('template.errors.total', {
                templateId: payload.templateId,
                error: payload.error.name,
            });
        });
    }

    private recordMetric(
        name: string,
        value: number,
        tags: Record<string, string>,
    ) {
        // Intégration avec Prometheus, DataDog, etc.
        this.getContextLogger().info(`Metric: ${name}`, { value, tags });
    }
}
```

## 🧪 Tests et validation

### Tests unitaires pour providers

```typescript
// tests/providers/sendgrid-provider.test.ts
import { SendGridProvider } from '../../src/providers/email/sendgrid-provider';

describe('SendGridProvider', () => {
    let provider: SendGridProvider;

    beforeEach(() => {
        provider = new SendGridProvider();
    });

    it('should send email successfully', async () => {
        const context = {
            applicationId: 'test',
            to: ['test@example.com'],
            subject: 'Test Subject',
            body: 'Test Body',
            channels: ['email'] as const,
        };

        const results = await provider.send(context);

        expect(results).toHaveLength(1);
        expect(results[0].success).toBe(true);
        expect(results[0].channel).toBe('email');
    });
});
```

### Validation des configurations

```typescript
// src/config/validation.ts
import { z } from 'zod';

const TemplateConfigSchema = z.object({
    templateId: z.string().min(1),
    providerId: z.string().min(1),
    path: z.string().min(1),
    channels: z.array(z.enum(['email', 'sms', 'push', 'webhook'])),
    dataTransformFiles: z.array(z.string()).optional(),
});

export function validateTemplateConfig(config: any): TemplateConfig {
    return TemplateConfigSchema.parse(config);
}
```

## 🎯 Bonnes pratiques

### 1. Gestion d'erreurs

```typescript
// Toujours wrapper les opérations critiques
try {
    await provider.send(context);
} catch (error) {
    contextLogger.error('Provider send failed', { error, context });
    bus.emit(EventNames.ProviderError, { providerId: provider.id, error });
    throw error; // Re-throw pour que le caller puisse réagir
}
```

### 2. Configuration par environnement

```typescript
// src/config/env.ts
export const envConfig = {
    development: {
        logLevel: 'debug',
        redis: { url: 'redis://localhost:6379' },
    },
    production: { logLevel: 'info', redis: { url: process.env.REDIS_URL } },
};

export const currentConfig =
    envConfig[process.env.NODE_ENV as keyof typeof envConfig];
```

### 3. Types stricts

```typescript
// Toujours typer les interfaces
interface StrictQueueMessage extends QueueMessage {
    businessData: {
        userId: string;
        email: string;
        // ... autres champs requis
    };
}
```

### 4. Documentation des événements

```typescript
// Documenter tous les événements personnalisés
/**
 * Émis quand un template est exécuté avec succès
 * @event TemplateAfterExecute
 * @type {object}
 * @property {string} templateId - ID du template
 * @property {object} result - Résultat de l'exécution
 */
bus.emit(EventNames.TemplateAfterExecute, { templateId, result });
```

Cette architecture modulaire permet d'étendre facilement le système selon les besoins tout en maintenant une séparation claire des responsabilités et une observabilité complète.
