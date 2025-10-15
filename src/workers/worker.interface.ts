import { WorkerConfig } from '../config';

export interface Worker {
    readonly id: string;
    readonly workerConfig: WorkerConfig;

    handleConnect(): Promise<void>;
    handleSubscribe(): Promise<void>;
    handleDisconnect(): Promise<void>;
}
