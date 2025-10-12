# Messenger

## 🎯 Vue d'ensemble

Messenger est un système de messagerie modulaire et configurable conçu pour gérer l'envoi de messages multi-canaux (email, SMS, push notifications, webhooks) à travers différents providers. Le système utilise une architecture basée sur des queues (BullMQ/Redis) pour assurer la scalabilité et la fiabilité des envois.

## 🏗️ Architecture

Le projet suit une architecture modulaire avec les composants suivants :

### Core Components

- **Services** : Gestion des providers, workers, templates, queues et messages
- **Workers** : Traitement asynchrone des messages via BullMQ
- **Providers** : Abstraction des services d'envoi (email, SMS, etc.)
- **Templates** : Système de templates Handlebars avec transforms de données
- **Queue System** : Gestion des files d'attente avec Redis/BullMQ

### Structure des dossiers

```
src/
├── api/                    # API REST (optionnel)
├── config/                 # Configuration centralisée
│   ├── applications.ts     # Configuration des applications
│   ├── providers.ts        # Configuration des providers
│   ├── queues.ts          # Configuration des queues
│   ├── scenarios.ts       # Configuration des scénarios
│   ├── templates.ts       # Configuration des templates
│   ├── workers.ts         # Configuration des workers
│   └── types.ts           # Types TypeScript
├── core/
│   ├── entities/          # Entités métier
│   ├── queues/           # Gestion des queues BullMQ
│   └── services/         # Services métier
├── providers/            # Implémentations des providers
│   └── email/           # Providers email (Gmail, SendGrid, Mock)
├── transforms/          # Transformations de données
├── workers/            # Implémentations des workers
└── templates/         # Templates Handlebars
```

### Flux de traitement

```
Queue → Worker → Scenario → Template → Transform → Provider → Destination
```

1. **Réception** : Un message arrive dans la queue BullMQ
2. **Worker** : Le worker BullMQ traite le message
3. **Scénario** : Le `ScenarioService` identifie le scénario à exécuter
4. **Template** : Résolution des templates associés au scénario
5. **Transform** : Application des transformations de données
6. **Rendu** : Génération du contenu final via le moteur de templates
7. **Provider** : Sélection du provider approprié (Gmail, SendGrid, etc.)
8. **Envoi** : Livraison via le canal configuré

## 🚀 Installation et Configuration

### Prérequis

- Node.js 18+
- Redis (via Docker ou installation locale)
- TypeScript

### Installation

1. **Cloner le projet**

```bash
git clone <repository-url>
cd messenger
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configurer l'environnement**

```bash
cp .env.example .env
```

Variables d'environnement importantes :

```env
NODE_ENV=dev
PORT=3000
REDIS_URL=redis://localhost:6379
TEMPLATE_DIR=./templates
TRANSFORMS_DIR=./transforms

# Provider configurations
GMAIL_CLIENT_ID=your-gmail-client-id
GMAIL_CLIENT_SECRET=your-gmail-secret
SENDGRID_API_KEY=your-sendgrid-key
```

4. **Démarrer Redis (avec Docker)**

```bash
docker-compose -f docker-compose.dev.yml up -d
```

5. **Compiler et démarrer**

```bash
# Développement
npm run dev

# Production
npm run build
npm start
```

## 📋 Configuration

### Configuration des Providers

Les providers sont configurés dans `src/config/providers.ts` :

```typescript
export const providersConfig: ProviderConfig[] = [
    {
        providerId: 'mock-multi-provider',
        name: 'mock',
        types: ['email'],
        description: 'Mock provider for testing',
    },
    {
        providerId: 'gmail-provider',
        name: 'gmail',
        types: ['email'],
        description: 'Gmail SMTP provider',
        options: {
            clientId: process.env.GMAIL_CLIENT_ID,
            clientSecret: process.env.GMAIL_CLIENT_SECRET,
        },
    },
];
```

### Configuration des Workers

Les workers sont configurés dans `src/config/workers.ts` :

```typescript
export const workersConfig: WorkerConfig[] = [
    {
        workerId: 'generic-bull-worker',
        queueId: 'messenger-queue',
        concurrency: 5,
        options: {},
    },
];
```

### Configuration des Templates

Les templates sont configurés dans `src/config/templates.ts` :

```typescript
export const templatesConfig: TemplateConfig[] = [
    {
        templateId: 'mqr_user_welcome',
        providerId: 'mock-multi-provider',
        path: 'generic_user_welcome',
        dataTransformFiles: ['user-transform.ts'],
    },
];
```

### Configuration des Queues

Les queues sont configurées dans `src/config/queues.ts` :

```typescript
export const queuesConfig: QueueConfig[] = [
    {
        queueId: 'messenger-queue',
        topic: 'messenger',
        redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
        type: 'bullmq',
    },
];
```

## 🎨 Templates

### Structure d'un Template

Chaque template est organisé dans un dossier sous `templates/` :

```
templates/
└── generic_user_welcome/
    ├── body.hbs          # Corps du message (Handlebars)
    ├── subject.hbs       # Sujet (optionnel)
    └── schema.ts         # Schéma de validation (optionnel)
```

### Exemple de Template Handlebars

```handlebars
<h1>Bienvenue {{userName}} !</h1>
<p>Merci de vous être inscrit sur {{applicationName}}.</p>
{{#if loginUrl}}
    <a href='{{loginUrl}}'>Se connecter</a>
{{/if}}
```

### Variables disponibles

- `{{userName}}` : Nom de l'utilisateur
- `{{applicationName}}` : Nom de l'application
- `{{loginUrl}}` : URL de connexion
- `{{supportEmail}}` : Email de support
- Plus toutes les variables personnalisées transmises

## 🔧 Développement

### Scripts disponibles

```bash
npm run dev        # Développement avec hot-reload
npm run build      # Compilation TypeScript
npm start         # Démarrage en production
npm run format    # Formatage du code avec Prettier
```

### Structure des logs

Les logs sont générés avec Pino et stockés dans `logs/app.log` :

```
[INFO] [BOOT] Initialisation des providers...
[INFO] [BOOT] Providers initialisés avec succès
[INFO] [BOOT] Initialisation des workers...
[INFO] [BOOT] Workers initialisés avec succès
[INFO] [BOOT] Messenger up and running.
```

### Monitoring avec Redis Insight

Redis Insight est disponible pour monitorer les queues :

- URL : http://localhost:5540
- Connexion : redis:6379

## � Utilisation

### Envoi de messages via Queue

```typescript
import { QueueProducer } from './src/core/queues/queue-producer';

// Envoyer un message de bienvenue
await QueueProducer.addJob('messenger-queue', {
    templateId: 'mqr_user_welcome',
    to: 'user@example.com',
    data: {
        userName: 'John Doe',
        applicationName: 'Mon App',
        loginUrl: 'https://app.com/login',
        supportEmail: 'support@app.com',
    },
});
```

### Simulation de production

Un script de test est disponible :

```bash
npm run ts-node src/scripts/tests/simulate-producer.ts
```

## 🛠️ Types de Canaux Supportés

- **Email** : Via Gmail, SendGrid, ou Mock provider
- **SMS** : À implémenter selon les providers
- **Push Notifications** : À implémenter selon les providers
- **Webhooks** : À implémenter selon les providers

## 📊 Monitoring et Debugging

### Logs

- Niveau de log configurable via `NODE_ENV`
- Logs structurés avec Pino
- Rotation automatique des logs

### Health Checks

Le système inclut des health checks pour :

- Connexion Redis
- Status des workers
- Status des providers

### Métriques

- Nombre de messages traités
- Temps de traitement moyen
- Taux d'erreur par provider

## 🔒 Sécurité

- Validation des données avec Zod
- Sanitisation des templates
- Authentification des providers

## 🛠️ Technologies utilisées

- **Node.js** + **TypeScript** : Runtime et langage
- **BullMQ** : Gestion des queues Redis
- **Redis** : Stockage des queues et cache
- **Handlebars** : Moteur de templates
- **Pino** : Logging structuré
- **Zod** : Validation de schémas

## 📝 Licence

ISC License
