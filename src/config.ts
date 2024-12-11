export type Config = {
    databasePath: string;
} & Partial<DefaultConfig>;

type DefaultConfig = {
    cacheInMemory: boolean;
    updateInterval: number; // in hours
    repoUrl: string;
};

export const defaultConfig: DefaultConfig = {
    cacheInMemory: false,
    updateInterval: 24,
    repoUrl: 'https://github.com/hteumeuleu/caniemail',
};
