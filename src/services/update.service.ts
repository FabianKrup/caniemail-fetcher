import fm from 'front-matter';
import * as fs from 'fs';
import * as path from 'path';
import { load as loadYaml } from 'js-yaml';

import { type Config, defaultConfig } from '../config';
import { GithubFetchService } from './github-fetch.service';
import {
    FeatureTypeChecker,
    NicenamesTypeChecker,
    type ApiResponse,
    type Feature,
    type Nicenames,
} from '../types/api-response';

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
                (this.config.updateInterval || defaultConfig.updateInterval) *
                    3600000
        ) {
            this.lastUpdate = now;
            fs.writeFileSync(
                path.join(__dirname, '../../data/lastUpdate.json'),
                JSON.stringify({ lastUpdate: now }),
            );
        }
    }

    private async fetchApiResponse(): Promise<ApiResponse | null> {
        return null;
    }

    private async fetchNicenames(): Promise<Nicenames | null> {
        const directoryContent = await this.fetchService.getContent(
            '_data/nicenames.yml',
        );

        if (directoryContent.type === 'file' && directoryContent.content) {
            const nicenames = loadYaml(directoryContent.content);

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
        const directoryContent =
            await this.fetchService.getContent('_features');

        if (directoryContent.type === 'dir') {
            const files = directoryContent.entries;
            const markdownFiles = files.filter(
                (file) =>
                    file.type === 'file' &&
                    file.name.endsWith('.md') &&
                    !file.name.startsWith('_'),
            );

            const featureContents = await Promise.all(
                markdownFiles.map(async (file) => {
                    const content = await this.fetchService.getContent(
                        file.path,
                    );

                    if (content.type === 'file' && content.content) {
                        const feature = fm(content.content).attributes;

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
