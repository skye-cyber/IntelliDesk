import { Buffer } from 'buffer'

window.Buffer = Buffer
if (typeof globalThis.Buffer === 'undefined') {
    globalThis.Buffer = Buffer;
}
