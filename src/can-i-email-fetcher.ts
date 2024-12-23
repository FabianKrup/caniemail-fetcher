import { UpdateService } from './services/update.service';

import type { Config } from 'config';

export class CanIEmailFetcher {
    private fetchService: UpdateService;

    constructor(config: Config) {
        this.fetchService = new UpdateService(config);

        console.log('GithubFetchService:', this.fetchService);
        console.log('Config:', config);
    }
}
