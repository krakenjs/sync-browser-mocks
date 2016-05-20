
import { patchPostMessage } from './postMessage';
import { patchPromise } from './promise';
import { patchSetTimeout, patchSetInterval } from './timeout';
import { patchXmlHttpRequest } from './xhr';

export function patchAll() {
    patchPostMessage();
    patchPromise();
    patchSetTimeout();
    patchSetInterval();
    patchXmlHttpRequest();
}

export * from './postMessage';
export * from './promise';
export * from './timeout';
export * from './xhr';