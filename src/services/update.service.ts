import { defaultConfig } from 'config';
import fm from 'front-matter';
import { writeFileSync } from 'fs';
import { load as loadYaml } from 'js-yaml';
import nunjucks from 'nunjucks';
import { basename, join } from 'path';

import {
    ApiResponseTypeChecker,
    FeatureTypeChecker,
    NicenamesTypeChecker,
} from '../types/api-response.checker';
import { GithubFetchService } from './github-fetch.service';

import type { Config } from 'config';
import type { ApiResponse, Feature, Nicenames } from 'types/api-response';

export class UpdateService {
    private lastUpdate: Date | null = null;
    private readonly fetchService: GithubFetchService;
    private readonly nunjucks = new nunjucks.Environment();

    constructor(private config: Config) {
        this.fetchService = new GithubFetchService(this.config);
        this.nunjucks.addFilter('jsonify', (value) => {
            return JSON.stringify(value, null, 2);
        });

        this.fetchApiResponse();
    }

    async checkForUpdates(): Promise<void> {
        const now = new Date();
        if (
            !this.lastUpdate ||
            now.getTime() - this.lastUpdate.getTime() >
                (this.config.updateInterval || defaultConfig.updateInterval) *
                    3600000
        ) {
            this.lastUpdate = now;
            writeFileSync(
                join(__dirname, '../../data/lastUpdate.json'),
                JSON.stringify({ lastUpdate: now }),
            );
        }
    }

    public async fetchApiResponse(): Promise<ApiResponse | null> {
        await this.fetchNicenames();
        await this.fetchFeatures();

        const file = await this.fetchService.getContent('_js/api.json');
        const site = {
            time: new Date().toISOString(),
            data: {
                nicenames: {
                    family: 'Example Family',
                    platform: 'Example Platform',
                    support: 'Example Support',
                    category: 'Example Category',
                },
            },
            features: [
                {
                    slug: 'example-feature',
                    title: 'Example Feature',
                    description: 'This is an example feature.',
                    url: 'http://example.com/feature',
                    category: 'example',
                    tags: ['example', 'feature'],
                    keywords: 'example, feature',
                    last_test_date: '2023-01-01',
                    test_url: 'http://example.com/test',
                    test_results_url: 'http://example.com/results',
                    stats: {},
                    notes: 'Some notes',
                    notes_by_num: {},
                },
            ],
        };

        if (
            file.type === 'file' &&
            file.content &&
            file.encoding === 'base64'
        ) {
            const fileContent = Buffer.from(
                file.content,
                file.encoding,
            ).toString('utf-8');

            const fileBody = fm(fileContent).body;
            const apiResponse = this.nunjucks.renderString(fileBody, {
                site,
            }) as unknown;

            console.log(apiResponse);

            if (ApiResponseTypeChecker.isApiResponse(apiResponse)) {
                return apiResponse;
            } else {
                console.error('Invalid api response data');
                return null;
            }
        } else {
            console.error('Failed to fetch api response');
            return null;
        }
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

                        const temp = fm(fileContent).attributes;

                        const feature = {
                            slug: basename(file.name, '.md'),
                            url: '',
                            tags: [],
                            notes: null,
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
