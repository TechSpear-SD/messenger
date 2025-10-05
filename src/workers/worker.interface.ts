import { WorkerConfig } from '../config';

export interface Worker {
    readonly id: string;
    readonly workerConfig: WorkerConfig;

    connect(): Promise<void>;
    subscribe(): Promise<void>;
    disconnect(): Promise<void>;
}
