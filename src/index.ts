import { CanIEmailFetcher } from './can-i-email-fetcher';

export * from './can-i-email-fetcher';

const fetcher = new CanIEmailFetcher({ databasePath: '', updateInterval: 12 });

fetcher.onUpdate((data) => {
    console.log('New data received:', data);
});
