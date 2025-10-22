import { Scenario } from '@prisma/client';
import prisma from '../../prisma';

class ScenarioService {
    public async getById(id: number): Promise<Scenario | null> {
        return prisma.scenario.findUnique({ where: { id } });
    }
    public async getByScenarioId(scenarioId: string): Promise<Scenario | null> {
        return prisma.scenario.findUnique({ where: { scenarioId } });
    }
}

export const scenarioService = new ScenarioService();
