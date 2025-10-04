import { ProviderService } from './core/services/provider.service';
import pinoLogger from './logger';

async function bootstrap() {
    try {
        ProviderService.init();
    } catch (error: any) {
        pinoLogger.error('Error during Messenger initialization:', error);
        process.exit(1);
    }

    try {
        pinoLogger.info('[BOOT] Initialisation des providers...');

        await ProviderService.init();
        pinoLogger.info('[BOOT] Providers initialisés avec succès ✅');
    } catch (err: any) {
        pinoLogger.error(err);
        pinoLogger.error(
            "Erreur lors de l'initialisation des providers. Arrêt de Messenger.",
        );

        process.exit(1);
    }

    pinoLogger.info('🚀 Messenger started.');
}

bootstrap();
