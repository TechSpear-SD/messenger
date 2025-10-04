import { queuesConfig } from '../../config/queues';

export class QueueService {
    static async getQueueById(queueId: string) {
        return queuesConfig.find((q) => q.queueId === queueId);
    }
}
