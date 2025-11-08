import { ChatUtil } from "../ConversationManager/util";

export async function html_preview(selector) {
    try {
        const element = document.querySelector(selector);
        if (!element) window.ModalManager.showMessage("Failed to locate codblock")
        const code = element?.textContent;

        if (!code) {
            return
        }

        waitForElement('#preview-view', (el) => {
            //const renderId = `html_render-${Math.random().toString(30).substring(3, 9)}`;
            el.innerHTML
            if (!new CanvasUtil().isCanvasOpen()) new ChatUtil().open_canvas()
        })

    } catch (err) {
        console.log("Error rendering html :", err)
        window.ModalManager.showMessage(err, 'error');
    }
}

window.html_preview = html_preview;
