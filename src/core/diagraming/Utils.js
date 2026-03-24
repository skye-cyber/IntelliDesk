import { waitForElement } from "../Utils/dom_utils";

let diagToggle;
let diagView;

waitForElement('#diagViewModal', setDiagView)
waitForElement('#diagToggle', setdiagDiagToggle)

function setDiagView(el) {
    diagView = el
}


function setdiagDiagToggle(el) {
    diagToggle = el
    el.addEventListener('click', () => {
        opendiagViewModal();
    })
}

export function opendiagViewModal() {
    //console.log('Open DiagView')
    diagView.classList.remove('hidden', 'opacity-0', 'translate-x-full');
    diagView.classList.add('opacity-100', 'translate-x-0')
}

export function closediagViewModal() {
    //console.log('Close DiagView')
    diagView.classList.remove('opacity-100', 'translate-x-0')
    diagView.classList.add('translate-x-full');
    setTimeout(() => {
        diagView.classList.add('opacity-0', 'hidden');
    }, 1000)
}


export async function exportSvgToPng(svgElementId, outputFileName = `${svgElementId}.png`) {
    let button_content = null
    let export_button = document.querySelector(`[data-value^=${svgElementId}]`)
    if (export_button) button_content = window.ModalManager.showLoading(export_button, 'exporting')

    try {

        //console.log('Exporting:', svgElementId)
        const parentDiv = document.getElementById(svgElementId);
        const svgElement = parentDiv.querySelector('svg');

        if (svgElement) {
            //console.log(svgElement)
        } else {
            alert("No diagram found to export.");
        }
        const svgData = new XMLSerializer().serializeToString(svgElement);

        // Create a canvas
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Create image from SVG data
        const img = new Image();
        const scale = 2; // 🔁 Adjust for resolution multiplier
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        img.crossOrigin = "anonymous";

        const result = await processImage();

        async function processImage() {
            return new Promise((resolve, reject) => {
                img.onload = async function() {
                    try {
                        // Create canvas and context
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');

                        // Set canvas size to scaled image size
                        canvas.width = img.width * scale;
                        canvas.height = img.height * scale;

                        // Scale drawing
                        ctx.setTransform(scale, 0, 0, scale, 0, 0);
                        ctx.drawImage(img, 0, 0);

                        // Get downloads path (assuming window.desk.api API is available)
                        const downloadsPath = window.desk.api.joinPath(
                            window.desk.api.getDownloadsPath(),
                            outputFileName
                        );

                        // Save image buffer (await inside onload is fine here)
                        const result = await window.desk.api.saveImageBuffer(canvas, downloadsPath, url);

                        // Resolve the Promise with the result
                        resolve(result);
                    } catch (err) {
                        reject(err);
                    }
                };

                img.onerror = () => reject(new Error('Failed to load image'));

                img.src = url;
            });
        }

        // Show success modal on success
        if (result === true) {
            window.ModalManager.showMessage(`Export successful: name=${outputFileName}`, 'success');

        } else {
            window.ModalManager.showMessage('Error saving image', 'error');
        }
    } catch (err) {
        console.error(err);
        window.ModalManager.showMessage(err, 'error');
    }
    finally {
        //window.ModalManager.hideLoader()
        if (export_button) window.ModalManager.hideLoading(export_button, button_content)
    }
}


window.closediagViewModal = closediagViewModal;
window.exportSvgToPng = exportSvgToPng;
