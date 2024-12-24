import EventEmitter from 'events';

import { DATA_UPDATED_EVENT, UpdateService } from './services/update.service';

import type { Config } from 'config';

export class CanIEmailFetcher {
    private updateService: UpdateService;
    private eventEmitter: EventEmitter;

    constructor(config: Config) {
        this.updateService = new UpdateService(config);
        this.eventEmitter = new EventEmitter();

        this.updateService.on(DATA_UPDATED_EVENT, (data) => {
            this.eventEmitter.emit('update', data);
        });
    }

    public onUpdate(callback: (data: any) => void): void {
        this.eventEmitter.on('update', callback);
    }

    public offUpdate(callback: (data: any) => void): void {
        this.eventEmitter.off('update', callback);
    }
}
