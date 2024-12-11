import { GithubFetchService } from './services/github-fetch.service';

import type { Config } from './config';

export class CanIEmailFetcher {
    private fetchService: GithubFetchService;

    constructor(config: Config) {
        this.fetchService = new GithubFetchService(config);
        this.fetchService.fetchFiles();

        console.log('Config:', config);
    }
}
