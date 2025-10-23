import { QueueMessage } from '../../core/entities/queue-message';
import { BullMQProducer } from '../../core/queues/queue-producer';

async function main() {
    const data: QueueMessage = {
        applicationId: 'tst',
        scenarioId: 'mqr_welcome_email',
        businessData: {
            name: 'John Doe',
            code: '123456',
            applicationName: 'TestApp',
        },
        to: ['recipient@example.com'],
    };
    await BullMQProducer.enqueue(data, 'redis://localhost:6379', 'messenger');

    console.log('Message enqueued successfully');
}

main().catch((err) => {
    console.error('Error in simulate-producer script:', err);
    process.exit(1);
});
