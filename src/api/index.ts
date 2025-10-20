import { Server } from './server';
import pinoLogger from '../logger';
import { config } from '../config';
import { ErrorHandlerService } from './services/error-handler.service';

/**
 * This is the entry point of the api server.
 * It creates an instance of the server class and starts the server.
 */

export async function apiBootstrap() {
    process.on('uncaughtException', (err: any) => {
        const errorHandlerService =
            ErrorHandlerService.getInstance() as ErrorHandlerService;
        errorHandlerService.handleUncaughtException(err);
        if (!errorHandlerService.isTrustedError(err)) {
            process.exit(1);
        }
    });

    process.on('unhandledRejection', (reason: string, p: Promise<any>) => {
        throw reason;
    });

    const port = config.port;
    const app = Server.getInstance().app;
    app.listen(port, () => {
        pinoLogger.info(`[API] Server is running on port ${port}`);
    });
}
