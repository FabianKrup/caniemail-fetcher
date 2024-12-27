type Config = {
    githubToken?: string;
} & Partial<DefaultConfig>;
type DefaultConfig = {
    updateInterval: number;
    repoUrl: string;
};

type ApiResponse = {
    last_update_date: string;
    nicenames: Nicenames;
    data: Feature[];
};

type Feature = {
    slug: string;
    title: string;
    description: string | null;
    url: string;
    category: keyof Category;
    tags: string[];
    keywords: string | null;
    last_test_date: string;
    test_url: string | null;
    test_results_url: string | null;
    stats: Stats;
    notes: string | null;
    notes_by_num: Record<string, string> | null;
    links: Record<string, string> | null;
};

type Nicenames = {
    family: Family;
    platform: Platform;
    support: Support;
    category: Category;
};

interface Family {
    [key: string]: string;
}

interface Platform {
    [key: string]: string;
}

interface Support {
    supported: string;
    mitigated: string;
    unsupported: string;
    unknown: string;
    mixed: string;
}

interface Category {
    html: string;
    css: string;
    image: string;
    others: string;
}

interface Stats {
    [platform: string]: {
        [device: string]: {
            [version: string]: string;
        };
    };
}

declare class CanIEmailFetcher {
    private readonly updateService;
    private readonly eventEmitter;
    private _currentApiResponse;
    constructor(config: Config);
    onUpdate(callback: (data: ApiResponse) => void): void;
    offUpdate(callback: (data: ApiResponse) => void): void;
    get currentApiResponse(): ApiResponse | null;
    get currentNicenames(): Nicenames | null;
}

export { CanIEmailFetcher };
