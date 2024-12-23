export type ApiResponse = {
    api_version: string;
    last_update_date: string;
    nicenames: Nicenames;
    data: Feature[];
};

export type Feature = {
    slug: string;
    title: string;
    description: string;
    url: string;
    category: keyof Category;
    tags: string[];
    keywords: string;
    last_test_date: string;
    test_url: string;
    test_results_url: string;
    stats: Stats;
    notes: string | null;
    notes_by_num: Record<string, string>;
    links: Record<string, string>;
};

export type Nicenames = {
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
