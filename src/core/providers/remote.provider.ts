import { Http } from '@angular/http';

import { RemoteService } from '../services/remote.service';

export function provideRemoteService(url: string) {
    return {
        provide: RemoteService, useFactory: (http) => {
            return new RemoteService(url, http);
        },
        deps: [Http]
    }
}
