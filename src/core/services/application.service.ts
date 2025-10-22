import { Application } from '@prisma/client';
import prisma from '../../prisma';

export class ApplicationService {
    static async getById(id: number): Promise<Application | null> {
        return prisma.application.findUnique({
            where: { id },
            include: { scenarios: true },
        });
    }

    static async getByAppId(appId: string): Promise<Application | null> {
        return prisma.application.findUnique({
            where: { appId },
            include: { scenarios: true },
        });
    }

    static async getAll(): Promise<Application[]> {
        return prisma.application.findMany({ include: { scenarios: true } });
    }
}
