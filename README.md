# Messenger

## 🎯 Vue d'ensemble

Messenger est un système de messagerie modulaire et configurable conçu pour gérer l'envoi de messages multi-canaux (email, SMS, push notifications, webhooks) à travers différents providers. Le système utilise une architecture basée sur des queues (BullMQ/Redis) pour assurer la scalabilité et la fiabilité des envois.

## 🏗️ Architecture

### Vue d'ensemble de l'architecture

Messenger suit une architecture modulaire basée sur les principes suivants :

- **Event-Driven Architecture** : Bus d'événements centralisé pour la communication inter-composants
- **Queue-based Processing** : Traitement asynchrone via BullMQ/Redis
- **Plugin System** : Système de plugins extensible pour l'observabilité et les fonctionnalités transversales
- **Provider Pattern** : Abstraction des fournisseurs de services de messagerie
- **Template Engine** : Moteur de templating Handlebars avec support de transformations de données

### Composants principaux

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Application   │───▶│    Scenario      │───▶│    Template     │
│   (mqr, tst)    │    │ (mqr_welcome_*) │    │ (user_welcome)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│     Queue       │◀───│     Worker       │◀───│   Provider      │
│   (BullMQ)      │    │ (GenericBull*)   │    │ (MockProvider)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📋 Concepts clés

### 1. Applications (`ApplicationConfig`)

Représentent les applications clientes qui utilisent Messenger :

```typescript
{
  appId: 'mqr',
  name: 'MenuQR',
  scenarioIds: ['mqr_welcome_email', 'mqr_confirmation_email']
}
```

### 2. Scénarios (`ScenarioConfig`)

Définissent les workflows de messagerie pour une application :

```typescript
{
  scenarioId: 'mqr_welcome_email',
  description: 'Email de bienvenue',
  templateIds: ['mqr_user_welcome']
}
```

### 3. Templates (`TemplateConfig`)

Configuration des templates de messages avec leur provider et canaux :

```typescript
{
  templateId: 'mqr_user_welcome',
  providerId: 'mock-multi-provider',
  path: 'generic_user_welcome',
  channels: ['email', 'sms'],
  dataTransformFiles: []
}
```

### 4. Providers (`ProviderConfig` + `AbstractProvider`)

Implémentations des fournisseurs de services de messagerie :

- Support multi-canaux (email, SMS, push, webhook)
- Gestion des erreurs par canal
- Interface uniforme via `AbstractProvider`

### 5. Workers (`WorkerConfig` + `BaseWorker`)

Processeurs de messages depuis les queues :

- Support BullMQ avec Redis
- Traitement concurrent configurable
- Gestion des contextes et correlation IDs

### 6. Queues (`QueueConfig`)

Configuration des files d'attente :

```typescript
{
  queueId: 'messenger-queue',
  topic: 'messenger',
  redisUrl: 'redis://localhost:6379',
  type: 'bullmq'
}
```

## 🔄 Flux de traitement

### 1. Enqueue d'un message

```typescript
const message: QueueMessage = {
    applicationId: 'mqr',
    scenarioId: 'mqr_welcome_email',
    businessData: { userName: 'John', applicationName: 'MenuQR' },
    to: ['user@example.com'],
};
await QueueProducer.enqueue(message);
```

### 2. Traitement par le Worker

1. **Worker** consomme le message depuis la queue BullMQ
2. **ScenarioService** charge la configuration du scénario
3. **TemplateService** traite chaque template du scénario :
    - Charge la configuration du template
    - Applique les transformations de données (`DataTransform`)
    - Rend le template avec Handlebars
    - Envoie via le provider configuré

### 3. Rendu et envoi

1. **TemplateRenderer** utilise Handlebars pour le rendu
2. **ProviderService** route vers le bon provider
3. **Provider** envoie sur les canaux configurés
4. **EventBus** diffuse les événements de suivi

## 🧩 Système d'événements

Le système utilise un EventBus typé pour la communication inter-composants :

```typescript
// Événements disponibles
EventNames.WorkerMessageReceived;
EventNames.ScenarioBeforeExecute;
EventNames.TemplateBeforeRender;
EventNames.ProviderAfterSend;
// ... et bien d'autres
```

### Plugin d'observabilité

Le `LoggerPlugin` s'abonne aux événements pour fournir une observabilité complète :

- Logs structurés avec corrélation IDs
- Métriques de performance (durée de traitement)
- Traçage des erreurs par composant

## 🔧 Contexte et logging

### Async Local Storage

Utilisation d'`AsyncLocalStorage` pour maintenir le contexte à travers les appels asynchrones :

```typescript
await runWithContext({ correlationId }, async () => {
    // Le contexte est disponible dans toute la chaîne d'appels
    contextLogger.info('Message processing started');
});
```

### Logger contextuel

```typescript
// Logger avec correlation ID automatique
contextLogger.info('Processing template', { templateId });
contextLogger.error('Template failed', { error, templateId });
```

## 🎨 Templates et transformations

### Structure des templates

```
templates/
  generic_user_welcome/
    subject.hbs
    body.hbs
```

### Templates Handlebars

```handlebars
{{! subject.hbs }}
Bienvenue
{{userName}}
sur
{{applicationName}}
!

{{! body.hbs }}
<h1>Bienvenue {{userName}}</h1>
<p>Merci de vous être inscrit sur {{applicationName}}.</p>
<a href='{{loginUrl}}'>Se connecter</a>
```

### Transformations de données

```typescript
// transforms/user-transform.ts
export default function userTransform(data: any) {
    return {
        ...data,
        fullName: `${data.firstName} ${data.lastName}`,
        registrationDate: new Date().toISOString(),
    };
}
```

## 🚀 Configuration et déploiement

### Variables d'environnement

```bash
NODE_ENV=dev
PORT=3000
REDIS_URL=redis://localhost:6379
QUEUE_TOPIC=messenger
TEMPLATE_DIR=./templates
TRANSFORMS_DIR=./transforms
```

### Docker Compose pour le développement

```yaml
services:
    redis:
        image: redis:7-alpine
        ports:
            - '6379:6379'

    redisinsight:
        image: redis/redisinsight:latest
        ports:
            - '5540:5540'
```

### Scripts NPM

```bash
npm run dev      # Développement avec nodemon
npm run build    # Compilation TypeScript
npm run start    # Production
npm run format   # Formatage Prettier
```

## 📁 Structure du projet

```
src/
├── app.ts                 # Application principale (Singleton)
├── index.ts              # Point d'entrée et bootstrap
├── logger.ts             # Configuration Pino
├── config/               # Configuration système
│   ├── index.ts         # Agrégation des configs
│   ├── types.ts         # Types TypeScript
│   ├── applications.ts  # Config des applications
│   ├── scenarios.ts     # Config des scénarios
│   ├── templates.ts     # Config des templates
│   ├── providers.ts     # Config des providers
│   ├── workers.ts       # Config des workers
│   └── queues.ts        # Config des queues
├── core/                # Cœur du système
│   ├── bus/             # Event Bus
│   │   ├── event-bus.ts
│   │   ├── event-names.ts
│   │   └── event-payloads.ts
│   ├── context.ts       # Gestion du contexte async
│   ├── entities/        # Entités métier
│   │   ├── queue-message.ts
│   │   ├── template-execution-ctx.ts
│   │   └── provider-execution-ctx.ts
│   ├── plugins/         # Système de plugins
│   │   ├── plugin.ts
│   │   ├── plugin-manager.ts
│   │   └── logger-plugin.ts
│   ├── queues/          # Gestion des queues
│   │   ├── bull-mq-connection.ts
│   │   └── queue-producer.ts
│   └── services/        # Services métier
│       ├── application.service.ts
│       ├── scenario.service.ts
│       ├── template.service.ts
│       ├── template-renderer.ts
│       ├── provider.service.ts
│       ├── worker.service.ts
│       └── queue.service.ts
├── providers/           # Implémentations providers
│   ├── provider-factory.ts
│   └── email/
│       ├── provider.interface.ts
│       └── mock-provider.ts
├── workers/             # Implémentations workers
│   ├── base-worker.ts
│   ├── worker.interface.ts
│   ├── worker-factory.ts
│   └── generic-bullmq-worker.ts
├── transforms/          # Transformations de données
│   ├── transform.type.ts
│   └── mock-transform.ts
├── scripts/tests/       # Scripts de test
│   └── simulate-producer.ts
└── api/                 # API REST (TODO)
    ├── server.ts
    ├── controllers/
    └── routers/
```

## 🔧 Technologies utilisées

### Core

- **TypeScript** : Langage principal avec typage strict
- **Node.js** : Runtime JavaScript
- **Pino** : Logger haute performance avec support pretty-print

### Queue & Redis

- **BullMQ** : Queue Redis robuste et scalable
- **IORedis** : Client Redis optimisé
- **Redis** : Base de données en mémoire pour les queues

### Templates

- **Handlebars** : Moteur de template pour le rendu HTML/text
- **File System** : Gestion des templates sur disque avec cache

### Development

- **Nodemon** : Hot reload en développement
- **Prettier** : Formatage de code automatique
- **Docker Compose** : Orchestration des services de développement

## 🎯 Cas d'usage typiques

### 1. Email de bienvenue

```typescript
// Message entrant dans la queue
{
  applicationId: 'mqr',
  scenarioId: 'mqr_welcome_email',
  businessData: {
    userName: 'Alice Dupont',
    applicationName: 'MenuQR',
    loginUrl: 'https://menuqr.app/login',
    supportEmail: 'support@menuqr.app'
  },
  to: ['alice@example.com']
}
```

### 2. Notification multi-canal

```typescript
// Template configuré pour email + SMS
{
  templateId: 'urgent_notification',
  providerId: 'multi-provider',
  channels: ['email', 'sms', 'push'],
  // Le provider tentera l'envoi sur les 3 canaux
}
```

### 3. Traitement avec transformation

```typescript
// Template avec transformation de données
{
  templateId: 'user_report',
  dataTransformFiles: ['aggregate-user-data.ts', 'format-dates.ts'],
  // Les transforms s'appliquent en séquence
}
```

## 🔍 Monitoring et observabilité

### Logs structurés

- Correlation IDs automatiques
- Logs contextuels par composant
- Métriques de performance intégrées

### Events tracking

- Suivi complet du cycle de vie des messages
- Événements granulaires par étape
- Support pour intégration monitoring externe

### Redis monitoring

- RedisInsight UI disponible sur `:5540`
- Visualisation des queues en temps réel
- Métriques de performance Redis

## 🚧 Roadmap et extensions

### API REST (TODO)

- Endpoints pour enqueue des messages
- API de gestion des configurations
- Webhook callbacks pour status

### Nouveaux providers

- Intégration SendGrid, Mailgun
- Support Twilio pour SMS
- Providers push notifications

### Fonctionnalités avancées

- Retry policies configurables
- Rate limiting par provider
- Template versioning
- A/B testing de templates
