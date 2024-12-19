export type ApiResponse = {
    api_version: string;
    last_update_date: string;
    nicenames: Nicenames;
    data: Feature[];
};

export type Feature = {
    title: string;
    description: string;
    category: keyof Category;
    keywords: string;
    last_test_date: string;
    test_url: string;
    test_results_url: string;
    stats: Stats;
    notes_by_num: Record<string, string>;
    links: Record<string, string>;
};

export type Nicenames = {
    family: Family;
    platform: Platform;
    support: Support;
    category: Category;
};

export interface Family {
    [key: string]: string;
}

export interface Platform {
    [key: string]: string;
}

export interface Support {
    supported: string;
    mitigated: string;
    unsupported: string;
    unknown: string;
    mixed: string;
}

export interface Category {
    html: string;
    css: string;
    image: string;
    others: string;
}

export interface Stats {
    [platform: string]: {
        [device: string]: {
            [version: string]: string;
        };
    };
}

export class ApiResponseTypeChecker {
    static isApiResponse(obj: any): obj is ApiResponse {
        return (
            obj &&
            typeof obj === 'object' &&
            'api_version' in obj &&
            'last_update_date' in obj &&
            'nicenames' in obj &&
            'data' in obj
        );
    }
}

export class FeatureTypeChecker {
    static isFeature(obj: any): obj is Feature {
        return (
            obj &&
            typeof obj === 'object' &&
            'title' in obj &&
            'description' in obj &&
            'category' in obj &&
            'keywords' in obj &&
            'last_test_date' in obj &&
            'test_url' in obj &&
            'test_results_url' in obj &&
            'stats' in obj &&
            'notes_by_num' in obj &&
            'links' in obj
        );
    }
}

export class NicenamesTypeChecker {
    static isNicenames(obj: any): obj is Nicenames {
        return (
            obj &&
            typeof obj === 'object' &&
            'family' in obj &&
            'platform' in obj &&
            'support' in obj &&
            'category' in obj
        );
    }
}
