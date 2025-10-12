import IORedis from 'ioredis';
import pinoLogger from '../../logger';

let connection: IORedis | null = null;

export function getRedisConnection(redisUrl: string): IORedis {
    if (!connection) {
        connection = new IORedis(redisUrl, {
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
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
