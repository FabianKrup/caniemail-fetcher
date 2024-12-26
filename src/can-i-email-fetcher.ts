import EventEmitter from 'events';

import { DATA_UPDATED_EVENT, UpdateService } from './services/update.service';

import type { Config } from 'config';
import type { ApiResponse, Nicenames } from 'types/api-response';

export class CanIEmailFetcher {
    private readonly updateService: UpdateService;
    private readonly eventEmitter: EventEmitter;

    private _currentApiResponse: ApiResponse | null = null;

    constructor(config: Config) {
        this.updateService = new UpdateService(config);
        this.eventEmitter = new EventEmitter();

        this.updateService.on(DATA_UPDATED_EVENT, (data) => {
            this._currentApiResponse = data;

            this.eventEmitter.emit('update', data);
        });
    }

    public onUpdate(callback: (data: ApiResponse) => void): void {
        this.eventEmitter.on('update', callback);
    }

    public offUpdate(callback: (data: ApiResponse) => void): void {
        this.eventEmitter.off('update', callback);
    }

    public get currentApiResponse(): ApiResponse | null {
        return this._currentApiResponse;
    }

    public get currentNicenames(): Nicenames | null {
        return this._currentApiResponse?.nicenames || null;
    }
}
