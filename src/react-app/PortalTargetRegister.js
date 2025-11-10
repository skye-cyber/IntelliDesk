import { waitForElement, waitForElementSimple } from "../renderer/js/Utils/dom_utils";

waitForElement('#diag-modal-content', (el) => {
    window.reactPortalBridge.registerContainer('diagram_canvas', el);
})


waitForElement('#chatArea', (el) => {
    window.reactPortalBridge.registerContainer('chatArea', el);
    window.streamingPortalBridge.registerStreamingComponent('chatArea', el);
})


export function RegisterCanvas() {
    waitForElementSimple('#canvas-wrapper', (el) => {
        window.reactPortalBridge.registerContainer('code_canvas', el);
        window.streamingPortalBridge.registerStreamingComponent('code_canvas', el);
    })
}

RegisterCanvas()
