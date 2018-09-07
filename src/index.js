
import { patchSetTimeout, patchSetInterval } from './timeout';
import { patchXmlHttpRequest } from './xhr';

export function patchAll() {
    patchSetTimeout();
    patchSetInterval();
    patchXmlHttpRequest();
}

export * from './timeout';
export * from './xhr';