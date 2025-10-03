import { config } from './config';
import { IQueueConsumer } from './core/entities/queue-consumer.interface';
import { QueueFactory } from './queues/queue-factory';

async function bootstrap() {
    const consumers: IQueueConsumer[] = QueueFactory.createAll(
        config.queue.queues,
    );

    for (const consumer of consumers) {
        await consumer.connect();

        await consumer.subscribe(async (message) => {
            console.log(
                `[${consumer.constructor.name}] Message reçu :`,
                message,
            );

            // Ici on envoie vers le service métier
            // ex: TemplateService → ProviderService
        });
    }

    console.log('🚀 Messenger started and listening to all queues.');
}

bootstrap();
