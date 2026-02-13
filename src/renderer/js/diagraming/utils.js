import { modalmanager } from "../StatusUIManager/Manager";

export async function DiagramToPngExportSvg(svgElementId, outputFileName = `${svgElementId}.png`) {
    let button_content = null
    let export_button = document.querySelector(`[data-value^=${svgElementId}]`)
    if (export_button) button_content = modalmanager.showLoading(export_button, 'exporting')

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
            modalmanager.showMessage(`Export successful: name=${outputFileName}`, 'success');

        } else {
            modalmanager.showMessage('Error saving image', 'error');
        }
    } catch (err) {
        console.error(err);
        modalmanager.showMessage(err, 'error');
    }
    finally {
        //modalmanager.hideLoader()
        if (export_button) modalmanager.hideLoading(export_button, button_content)
    }
}
