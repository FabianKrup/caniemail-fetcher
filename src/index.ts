import { CanIEmailFetcher } from 'can-i-email-fetcher';

export * from 'can-i-email-fetcher';

const fetcher = new CanIEmailFetcher({ databasePath: '', updateInterval: 12 });

console.log(fetcher);
