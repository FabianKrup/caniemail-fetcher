import type { Config } from './config';
import { GithubFetchService } from './services/github-fetch.service';

export class CanIEmailFetcher {
    private fetchService: GithubFetchService;

    constructor(config: Config) {
        this.fetchService = new GithubFetchService(config);

        console.log('Config:', config);
    }
}
