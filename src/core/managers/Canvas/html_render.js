import { modalmanager } from "../../StatusUIManager/Manager";
import { globalEventBus } from "../../Globals/eventBus.ts";

export async function html_preview(selector) {
    try {
        const element = document.querySelector(selector);
        if (!element) modalmanager.showMessage("Failed to locate codblock")
        const code = element?.textContent;

        if (!code) {
            return
        }

        waitForElement('#preview-view', (el) => {
            //const renderId = `html_render-${Math.random().toString(30).substring(3, 9)}`;
            el.innerHTML
            if (!new CanvasUtil().isCanvasOpen()) globalEventBus.emit('canvas:toggle')
        })

    } catch (err) {
        console.log("Error rendering html :", err)
        modalmanager.showMessage(err, 'error');
    }
}

window.html_preview = html_preview;
