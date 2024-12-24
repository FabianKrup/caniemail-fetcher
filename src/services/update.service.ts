import { defaultConfig } from 'config';
import EventEmitter from 'events';
import { load as loadYaml } from 'js-yaml';
import { basename } from 'path';

import {
    FeatureTypeChecker,
    NicenamesTypeChecker,
} from '../types/api-response.checker';
import { frontmatterParse } from './frontmatter.service';
import { GithubFetchService } from './github-fetch.service';

import type { Config } from 'config';
import type { ApiResponse, Feature, Nicenames } from 'types/api-response';

export class UpdateService extends EventEmitter {
    private lastUpdate: Date | null = null;
    private readonly fetchService: GithubFetchService;

    constructor(private config: Config) {
        super();

        this.fetchService = new GithubFetchService(this.config);

        this.fetchApiResponse();
        setInterval(() => this.checkForUpdates(), 3600000);
    }

    async checkForUpdates(): Promise<void> {
        const now = new Date();

        if (
            !this.lastUpdate ||
            now.getTime() - this.lastUpdate.getTime() >
                (this.config.updateInterval || defaultConfig.updateInterval) *
                    3600000 // Convert hours to milliseconds (1 hour = 3600000 ms)
        ) {
            this.lastUpdate = now;
            this.fetchApiResponse();
        }
    }

    public async fetchApiResponse(): Promise<ApiResponse | null> {
        const nicenames = await this.fetchNicenames();
        const features = await this.fetchFeatures();

        if (!nicenames || !features) {
            return null;
        }

        return {
            last_update_date: new Date().toISOString(),
            nicenames: nicenames,
            data: features,
        };
    }

    private async fetchNicenames(): Promise<Nicenames | null> {
        const file = await this.fetchService.getContent('_data/nicenames.yml');

        if (
            file.type === 'file' &&
            file.content &&
            file.encoding === 'base64'
        ) {
            const fileContent = Buffer.from(
                file.content,
                file.encoding,
            ).toString('utf-8');

            const nicenames = loadYaml(fileContent);

            if (NicenamesTypeChecker.isNicenames(nicenames)) {
                return nicenames;
            } else {
                console.error('Invalid nicenames data');
                return null;
            }
        } else {
            console.error('Failed to fetch nicenames');
            return null;
        }
    }

    private async fetchFeatures(): Promise<Feature[]> {
        const directory = await this.fetchService.getContent('_features');

        if (directory.type === 'dir') {
            const files = directory.entries;
            const markdownFiles = files.filter(
                (file) =>
                    file.type === 'file' &&
                    file.name.endsWith('.md') &&
                    !file.name.startsWith('_'),
            );

            const featureContents = await Promise.all(
                markdownFiles.map(async (filePointer) => {
                    const file = await this.fetchService.getContent(
                        filePointer.path,
                    );

                    if (
                        file.type === 'file' &&
                        file.content &&
                        file.encoding === 'base64'
                    ) {
                        const fileContent = Buffer.from(
                            file.content,
                            file.encoding,
                        ).toString('utf-8');

                        const temp = frontmatterParse(fileContent, {
                            ignoreDuplicateKeys: true,
                        }).attributes;

                        const feature = {
                            slug: basename(file.name, '.md'),
                            description: null,
                            url: '',
                            tags: [],
                            keywords: null,
                            test_url: null,
                            test_results_url: null,
                            notes: null,
                            notes_by_num: null,
                            links: null,
                            ...(typeof temp === 'object' ? temp : {}),
                        };

                        if (FeatureTypeChecker.isFeature(feature)) {
                            return feature;
                        } else {
                            console.error('Invalid feature data');
                            return null;
                        }
                    }

                    return null;
                }),
            ).then((results) => results.filter((result) => result !== null));

            return featureContents;
        }

        return [];
    }
}
