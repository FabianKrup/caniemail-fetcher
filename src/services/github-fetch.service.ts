import axios from 'axios';

import { defaultConfig, type Config } from '../config';

const GITHUB_API_URL = 'https://api.github.com';

type RepositoryContentDirectory = {
    name: string;
    path: string;
    sha: string;
    size: number;
    url: string;
    html_url: string;
    git_url: string;
    download_url: null;
    type: 'dir';
    _links: {
        self: string;
        git: string;
        html: string;
    };
    entries: RepositoryContentFile[];
};

type RepositoryContentFile = {
    name: string;
    path: string;
    sha: string;
    size: number;
    url: string;
    html_url: string;
    git_url: string;
    download_url: string;
    type: 'file';
    content?: string;
    encoding?: string;
    _links: {
        self: string;
        git: string;
        html: string;
    };
};

export class GithubFetchService {
    private readonly repo_owner: string;
    private readonly repo_name: string;

    constructor(private config: Config) {
        const result = this.extractOwnerAndRepoFromGithubUrl(
            this.config?.repoUrl ?? defaultConfig.repoUrl,
        );

        if (result) {
            const { owner, repo } = result;
            this.repo_owner = owner;
            this.repo_name = repo;
        } else {
            throw new Error('Failed to extract owner and repo from URL');
        }
    }

    async fetchFiles(): Promise<void> {
        const isPermissive = await this.isPermissiveLicense();
        console.log('Is permissive:', isPermissive);

        const nicenamesContent = await this.getContent('_data/nicenames.yml');
        console.log('nicenames:', nicenamesContent);

        const featuresContent = await this.getContent('_features');
        console.log('features:', featuresContent);

        /*const result = this.extractOwnerAndRepoFromGithubUrl(
            this.config.repoUrl,
        );
        if (result) {
            const { owner, repo } = result;
            console.log(owner, repo);
        } else {
            console.error('Failed to extract owner and repo from URL');
        }

        const apiUrl = `${this.config.repoUrl}/archive/refs/heads/main.zip`;
        const response = await axios.get(apiUrl, {
            responseType: 'arraybuffer',
        });
        const zipPath = path.join(__dirname, '../../data/repo.zip');
        fs.writeFileSync(zipPath, response.data);*/
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

    private async isPermissiveLicense(): Promise<boolean> {
        const apiUrl = `${GITHUB_API_URL}/repos/${this.repo_owner}/${this.repo_name}/license`;

        try {
            const response = await axios.get(apiUrl, {
                headers: {
                    Accept: 'application/vnd.github+json',
                    'X-GitHub-Api-Version': '2022-11-28',
                },
            });

            return ['mit', 'unlicense', 'apache-2.0'].includes(
                response.data.license.key,
            );
        } catch (error) {
            console.error('Error fetching license information:', error);
            return false;
        }
    }

    private async getContent(
        path: string,
    ): Promise<RepositoryContentDirectory | RepositoryContentFile> {
        const apiUrl = `${GITHUB_API_URL}/repos/${this.repo_owner}/${this.repo_name}/contents/${path}`;

        try {
            const response = await axios.get(apiUrl, {
                headers: {
                    Accept: 'application/vnd.github.object+json',
                    'X-GitHub-Api-Version': '2022-11-28',
                },
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching file content from GitHub:', error);
            throw new Error('Failed to fetch file content');
        }
    }
}
