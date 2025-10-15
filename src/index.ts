import { MessengerApp } from './app';
import { WorkerService } from './core/services/worker.service';
import pinoLogger from './logger';

process.on('SIGINT', async () => {
    pinoLogger.warn('Shutting down gracefully...');
    WorkerService.disconnectAll();
    process.exit(0);
});
async function bootstrap() {
    const app = MessengerApp.getInstance();

    try {
        await app.init();
        await app.start();
    } catch (err) {
        pinoLogger.fatal(err, 'Critical error during startup. Exiting...');
        process.exit(1);
    }

    process.on('SIGINT', async () => {
        pinoLogger.warn('Shutting down gracefully...');
        await app.shutdown();
        process.exit(0);
    });
}

bootstrap();
