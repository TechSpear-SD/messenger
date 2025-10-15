import IORedis from 'ioredis';
import pinoLogger from '../../logger';

let connection: IORedis | null = null;

export function getRedisConnection(
    redisUrl: string,
    maxRetries: number = 5,
    delayMs: number = 10000,
): IORedis {
    if (!connection) {
        let retries = 0;
        connection = new IORedis(redisUrl, {
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
            retryStrategy(times) {
                retries++;
                if (retries > maxRetries) {
                    pinoLogger.error(
                        `Redis connection failed after ${maxRetries} attempts, giving up.`,
                    );
                    return null;
                }
                const delay = Math.min(times * delayMs, 5000);
                pinoLogger.warn(
                    `Redis reconnect attempt ${retries} (waiting ${delay}ms)`,
                );
                return delay;
            },
        });
        pinoLogger.info(`Redis connected to ${redisUrl}`);
    }
    return connection;
}

export async function closeRedisConnection() {
    if (connection) {
        await connection.quit();
        pinoLogger.info(`Redis connection closed`);
        connection = null;
    }
}
