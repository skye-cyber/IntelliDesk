import { waitForElement, waitForElementSimple } from "../renderer/js/Utils/dom_utils";

waitForElement('#diag-modal-content', (el) => {
    window.reactPortalBridge.registerContainer('diagram_canvas', el);
})


waitForElement('#chatArea', (el) => {
    window.reactPortalBridge.registerContainer('chatArea', el);
    window.streamingPortalBridge.registerStreamingComponent('chatArea', el);
})

waitForElement('#conversations', (el) => {
    window.reactPortalBridge.registerContainer('conversations', el);
    window.streamingPortalBridge.registerStreamingComponent('conversations', el);
})

waitForElementSimple('.FilePreview', (el) => {
    window.reactPortalBridge.registerContainer('FilePreview', el);
    window.streamingPortalBridge.registerStreamingComponent('FilePreview', el);
})


export function RegisterCanvas() {
    waitForElementSimple('#canvas-wrapper', (el) => {
        window.reactPortalBridge.registerContainer('code_canvas', el);
        window.streamingPortalBridge.registerStreamingComponent('code_canvas', el);
    })
}

RegisterCanvas()
