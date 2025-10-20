import { Server } from './server';
import pinoLogger from '../logger';
import { config } from '../config';
import { ErrorHandlerService } from './services/error-handler.service';

/**
 * This is the entry point of the application.
 * It creates an instance of the server class and starts the server.
 */

// uncaughtException is emitted when an uncaught JavaScript exception bubbles all the way back to the event loop.
process.on('uncaughtException', (err: any) => {
    const errorHandlerService =
        ErrorHandlerService.getInstance() as ErrorHandlerService;
    errorHandlerService.handleUncaughtException(err);
    if (!errorHandlerService.isTrustedError(err)) {
        process.exit(1);
    }
});

// unhandledRejection is emitted when a Promise is rejected but there is no error handler to catch the rejection.
process.on('unhandledRejection', (reason: string, p: Promise<any>) => {
    throw reason;
});

// Start the server
const port = config.port;
export const app = Server.getInstance().app;
export const server = app.listen(port, () => {
    pinoLogger.info(`Server is running on port ${port}`);
});
