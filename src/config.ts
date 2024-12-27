export type Config = {
    githubToken?: string;
} & Partial<DefaultConfig>;

type DefaultConfig = {
    updateInterval: number; // in hours
    repoUrl: string;
};

export const defaultConfig: DefaultConfig = {
    updateInterval: 24,
    repoUrl: 'https://github.com/hteumeuleu/caniemail',
};
