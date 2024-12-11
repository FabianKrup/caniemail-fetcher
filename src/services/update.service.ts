/*import * as fs from 'fs';
import * as path from 'path';

import { GithubFetchService } from './fetch.service';

import type { Config } from '../config';

export class UpdateService {
    private lastUpdate: Date | null = null;
    private readonly fetchService: GithubFetchService;

    constructor(private config: Config) {
        this.fetchService = new GithubFetchService(this.config);
    }

    async checkForUpdates(): Promise<void> {
        const now = new Date();
        if (
            !this.lastUpdate ||
            now.getTime() - this.lastUpdate.getTime() >
                this.config.updateInterval * 3600000
        ) {
            await this.fetchService.fetchFiles();
            this.lastUpdate = now;
            fs.writeFileSync(
                path.join(__dirname, '../../data/lastUpdate.json'),
                JSON.stringify({ lastUpdate: now }),
            );
        }
    }
}*/
