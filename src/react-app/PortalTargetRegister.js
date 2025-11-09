import { waitForElement, waitForElementSimple } from "../renderer/js/Utils/dom_utils";

waitForElement('#diag-modal-content', (el) => {
    window.reactPortalBridge.registerContainer('diagram_canvas', el);
    console.log("Registered diag-modal")
})


waitForElement('#chatArea', (el) => {
    window.reactPortalBridge.registerContainer('chatArea', el);
    window.streamingPortalBridge.registerStreamingComponent('chatArea', el);
    console.log("Registered chatArea")
})


export function RegisterCanvas() {
    waitForElementSimple('#canvas-wrapper', (el) => {
        window.reactPortalBridge.registerContainer('code_canvas', el);
        window.streamingPortalBridge.registerStreamingComponent('code_canvas', el);
        console.log('Registering code-canvas')
    })
}

RegisterCanvas()
