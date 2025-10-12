import { ApplicationConfig, config } from '../../config';

export class ApplicationService {
    static async getById(appId: string): Promise<ApplicationConfig | null> {
        return config.applications.find((app) => app.appId === appId) || null;
    }
}
