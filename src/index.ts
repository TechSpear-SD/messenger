import { ProviderService } from './core/services/provider.service';
import { WorkerService } from './core/services/worker.service';
import pinoLogger from './logger';

process.on('SIGINT', async () => {
    pinoLogger.warn('Shutting down gracefully...');
    WorkerService.disconnectAll();
    process.exit(0);
});

async function bootstrap() {
    try {
        pinoLogger.info('[BOOT] Initialisation des workers...');
        await WorkerService.init();
        pinoLogger.info('[BOOT] Workers initialisés avec succès ✅');

        pinoLogger.info('[BOOT] Initialisation des providers...');
        await ProviderService.init();
        pinoLogger.info('[BOOT] Providers initialisés avec succès ✅');
    } catch (err: any) {
        pinoLogger.error(
            `Erreur lors de l'initialisation des providers. Arrêt de Messenger. ${err.message}`,
        );

        process.exit(1);
    }

    pinoLogger.info('🚀 Messenger started.');
}

bootstrap();
