const diagView = document.getElementById('diagViewModal');
const diagToggle = document.getElementById('diagToggle');

function opendiagViewModal() {
    //console.log('Open DiagView')
    diagView.classList.remove('opacity-0', 'translate-x-full');
    diagView.classList.add('opacity-100', 'translate-x-0')
}

function closediagViewModal() {
    //console.log('Close DiagView')
    diagView.classList.remove('opacity-100', 'translate-x-0')
    diagView.classList.add('translate-x-full');
    setTimeout(() => {
        diagView.classList.add('opacity-0');
    }, 1000)
}

diagToggle.addEventListener('click', () => {
    opendiagViewModal();
})

async function exportSvgToPng(svgElementId, outputFileName = `${svgElementId}.png`) {
    try {
        console.log('Exporting:', svgElementId)
        const parentDiv = document.getElementById(svgElementId);
        const svgElement = parentDiv.querySelector('svg');

        if (svgElement) {
            //console.log(svgElement)
        } else {
            alert("No diagram found to export.");
        }
        const svgData = new XMLSerializer().serializeToString(svgElement);

        //show loading status
        await window.HandleLoading(task = 'show', 'Exporting diagram to png...');

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

                        // Get downloads path (assuming window.electron API is available)
                        const downloadsPath = window.electron.joinPath(
                            window.electron.getDownloadsPath(),
                            outputFileName
                        );

                        // Save image buffer (await inside onload is fine here)
                        const result = await window.electron.saveImageBuffer(canvas, downloadsPath, url);

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


        console.log(result)

        //  hide loading on completion
        result ? await window.HandleLoading(task = 'hide') : '';

        // Show success modal on success
        if (result === true) {
            await window.displayStatus(message = `Export successful: name=${outputFileName}`, type = 'success');

            // hide sucess message after 4 seconds
            setTimeout(async () => {
                await window.hideStatus(type = 'success')
            }, 5000);
        } else {
            await window.HandleLoading(task = 'hide')
            await window.displayStatus(message = 'Error saving image', type = 'error');
        }
    } catch (err) {
        console.error(err);
        await window.displayStatus(message = err, type = 'error');
    }
}

//opendiagViewModal();
window.opendiagViewModal = opendiagViewModal;
window.closediagViewModal = closediagViewModal;
window.exportSvgToPng = exportSvgToPng;
