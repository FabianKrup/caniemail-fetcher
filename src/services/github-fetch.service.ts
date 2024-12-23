import axios from 'axios';

import { defaultConfig } from '../config';

import type { Config } from '../config';
import type {
    RepositoryContentDirectory,
    RepositoryContentFile,
} from '../types/github-api';

const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_API_VERSION = '2022-11-28';

export class GithubFetchService {
    private readonly repoOwner: string;
    private readonly repoName: string;
    private readonly githubToken: string | undefined;

    constructor(private config: Config) {
        if (config.githubToken) {
            this.githubToken = config.githubToken;
        }

        const result = this.extractOwnerAndRepoFromGithubUrl(
            this.config?.repoUrl ?? defaultConfig.repoUrl,
        );

        if (result) {
            const { owner, repo } = result;
            this.repoOwner = owner;
            this.repoName = repo;
        } else {
            throw new Error('Failed to extract owner and repo from URL');
        }
    }

    public async isPermissiveLicense(): Promise<boolean> {
        const apiUrl = `${GITHUB_API_URL}/repos/${this.repoOwner}/${this.repoName}/license`;

        try {
            const response = await axios.get(apiUrl, {
                headers: this.getAuthHeaders(),
            });

            return ['mit', 'unlicense', 'apache-2.0'].includes(
                response.data.license.key,
            );
        } catch (error) {
            console.error('Error fetching license information:', error);
            return false;
        }
    }

    public async getLastUpdate(): Promise<string | null> {
        const apiUrl = `${GITHUB_API_URL}/repos/${this.repoOwner}/${this.repoName}/commits?per_page=1`;

        try {
            const response = await axios.get(apiUrl, {
                headers: this.getAuthHeaders(),
            });

            return response.data[0].commit.committer.date;
        } catch (error) {
            console.error('Error fetching last update:', error);
            return null;
        }
    }

    public async getContent(
        path: string,
    ): Promise<RepositoryContentDirectory | RepositoryContentFile> {
        const apiUrl = `${GITHUB_API_URL}/repos/${this.repoOwner}/${this.repoName}/contents/${path}`;

        try {
            const response = await axios.get(apiUrl, {
                headers: {
                    ...this.getAuthHeaders(),
                    Accept: 'application/vnd.github.object+json',
                },
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching file content from GitHub:', error);
            throw new Error('Failed to fetch file content');
        }
    }

    private extractOwnerAndRepoFromGithubUrl(url: string): {
        owner: string;
        repo: string;
    } | null {
        const urlObj = new URL(url);
        const owner =
            urlObj.hostname === 'github.com'
                ? urlObj.pathname.split('/')[1]
                : null;
        const repo = urlObj.pathname.split('/')[2];

        if (owner && repo) {
            return { owner, repo };
        } else {
            return null;
        }
    }

    private getAuthHeaders() {
        const headers: Record<string, string> = {
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': GITHUB_API_VERSION,
        };

        if (this.githubToken) {
            headers['Authorization'] = `Bearer ${this.githubToken}`;
        }

        return headers;
    }
}
