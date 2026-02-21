import { waitForElement, waitForElementSimple } from "../renderer/js/Utils/dom_utils";
import { staticPortalBridge, streamingPortalBridge } from "../renderer/js/PortalBridge";
waitForElement('#diag-modal-content', (el) => {
    staticPortalBridge.registerContainer('diagram_canvas', el);
})


waitForElement('#chatArea', (el) => {
    staticPortalBridge.registerContainer('chatArea', el);
    streamingPortalBridge.registerStreamingComponent('chatArea', el);
})


waitForElement('#main-container', (el) => {
    staticPortalBridge.registerContainer('"mainContainer"', el);
    streamingPortalBridge.registerStreamingComponent('mainContainer', el);
})


waitForElement('#conversations', (el) => {
    staticPortalBridge.registerContainer('conversations', el);
    streamingPortalBridge.registerStreamingComponent('conversations', el);
})

waitForElementSimple('.FilePreview', (el) => {
    staticPortalBridge.registerContainer('FilePreview', el);
    //streamingPortalBridge.registerStreamingComponent('FilePreview', el);
})

waitForElement('#chat-container', (el) => {
    staticPortalBridge.registerContainer('chatContainer', el);
    //streamingPortalBridge.registerStreamingComponent('chatContainer', el);
})

waitForElement('#userInputContainer', (el) => {
    staticPortalBridge.registerContainer('userInputContainer', el);
    //streamingPortalBridge.registerStreamingComponent('userInput-wrapper', el);
})

waitForElement('#message-container', (el) => {
    staticPortalBridge.registerContainer('messageContainer', el);
})


waitForElement('#confirm-dialog-container', (el) => {
    staticPortalBridge.registerContainer('ConfirmdialogContainer', el);
})

export function RegisterCanvas() {
    waitForElementSimple('#canvas-wrapper', (el) => {
        staticPortalBridge.registerContainer('code_canvas', el);
        streamingPortalBridge.registerStreamingComponent('code_canvas', el);
    })
}

RegisterCanvas()
