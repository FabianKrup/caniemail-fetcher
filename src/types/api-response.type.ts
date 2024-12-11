export type Root = {
    api_version: string;
    last_update_date: string;
    nicenames: Nicenames;
    data: Data[];
};

export type Nicenames = {
    family: Family;
    platform: Platform;
    support: Support;
    category: Category;
};

export type Family = Record<string, string>;

export type Platform = Record<string, string>;

export type Support = {
    supported: string;
    mitigated: string;
    unsupported: string;
    unknown: string;
    mixed: string;
};

export type Category = {
    html: string;
    css: string;
    image: string;
    others: string;
};

export type Data = {
    slug: string;
    title: string;
    description?: string;
    url: string;
    category: keyof Category;
    tags: string[];
    keywords?: string;
    last_test_date: string;
    test_url: string;
    test_results_url?: string;
    stats: Stats;
    notes?: string;
    notes_by_num?: Record<string, string>;
};

export type Stats = Record<string, Record<string, Record<string, string>>>;
