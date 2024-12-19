export type RepositoryContentBase = {
    name: string;
    path: string;
    sha: string;
    size: number;
    url: string;
    html_url: string;
    git_url: string;
    _links: {
        self: string;
        git: string;
        html: string;
    };
};

export type RepositoryContentDirectory = RepositoryContentBase & {
    download_url: null;
    type: 'dir';
    entries: RepositoryContentFile[];
};

export type RepositoryContentFile = RepositoryContentBase & {
    download_url: string;
    type: 'file';
    content?: string;
    encoding?: string;
};
