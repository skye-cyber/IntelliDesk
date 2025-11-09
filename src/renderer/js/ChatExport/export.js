import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toJpeg } from 'html-to-image';
import { saveAs } from 'file-saver';

export async function HTML2Word(event, selector) {
    event.preventDefault();

    window.ModalManager.startLoader("Exporting message to word...")
    const par = getParents(event);
    toggleExportOptions(par, true, true);
    const element = document.querySelector(selector);

    if (element) {
        console.log('Exporting to Word...');

        try {
            // Import the entire module and access what you need
            const htmlToDocxModule = await import('html-to-docx');

            // Try different ways to access the function
            const htmlToDocx = htmlToDocxModule.default || htmlToDocxModule;

            const docx = await htmlToDocx(element.outerHTML);
            saveAs(docx, 'output.docx');
        } catch (err) {
            window.ModalManager.hideLoader()
            console.error('Error creating Word document:', err);
            // Fallback to plain text
            exportAsPlainText(element);
        }
    } else {
        console.error('Element not found for the given selector:', selector);
    }
    window.ModalManager.hideLoader()
}


// Fallback function to export as plain text
function exportAsPlainText(element) {
    const textContent = element.innerText || element.textContent;
    const blob = new Blob([textContent], { type: 'text/plain' });
    saveAs(blob, 'output.txt');
}

/*export function SuperHTML2Word(event, selector) {
    event.preventDefault(); // Prevent the default action of the anchor tag
    const par = getParents(event);
    toggleExportOptions(par, true, true); // Hide export options
    const element = document.querySelector(selector);
    if (element) {
        console.log('Exporting to Word...');

        // Convert HTML to DOCX
        htmlDocx.asBlob(element.outerHTML, { orientation: 'portrait' })
        .then((docx) => {
            // Save the DOCX file
            saveAs(docx, 'output-Super.docx');
        })
        .catch((err) => {
            console.error('Error creating Word document:', err);
        });

    } else {
        console.error('Element not found for the given selector:', selector);
    }
}*/

export function HTML2Pdf(event, selector) {
    event.preventDefault(); // Prevent the default action of the anchor tag
    window.ModalManager.startLoader("Exporting message to pdf...")

    const par = getParents(event);
    toggleExportOptions(par, true, true); // Hide export options
    const element = document.querySelector(`${selector}`);
    if (element) {
        console.log('Exporting to PDF...');

        html2canvas(element).then(canvas => {
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pdf = new jsPDF();
            const imgProps = pdf.getImageProperties(imgData);

            // Provide default margin values
            const defaultMargin = 0; // Default margin in mm
            const pdfWidth = pdf.internal.pageSize.getWidth() - 2 * defaultMargin;
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
            const pageHeight = pdf.internal.pageSize.getHeight() - 2 * defaultMargin;

            // Calculate the total number of pages needed
            const totalPages = Math.ceil(imgHeight / pageHeight);

            for (let i = 0; i < totalPages; i++) {
                // Add a new page if it's not the first one
                if (i > 0) {
                    pdf.addPage();
                }

                // Calculate the y position for the current page
                const posY = -i * pageHeight;

                // Add image with margins
                pdf.addImage(imgData, 'JPEG', defaultMargin, posY, pdfWidth, imgHeight);
            }

            pdf.save('output.pdf');
        }).catch((err) => {
            window.ModalManager.hideLoader()
            console.error('Error creating PDF:', err);
        });
    } else {
        console.error('Element not found for the given selector:', selector);
    }
    window.ModalManager.hideLoader()
}

export function HTML2Jpg(event, selector) {
    event.preventDefault();

    window.ModalManager.startLoader("Exporting message to jpg...")

    const par = getParents(event);
    toggleExportOptions(par, true, true);

    const element = document.querySelector(selector);

    if (!element) {
        console.error('Element not found for the given selector:', selector);
        return;
    }

    console.log('Exporting to JPG...');

    const width = element.offsetWidth;
    const height = element.offsetHeight;

    // ✅ Add useCORS & cacheBust
    toJpeg(element, {
        width,
        height,
        quality: 0.95,
        cacheBust: true,
        useCORS: true,
    })
        .then(async (dataUrl) => {
            console.log('Image created successfully');

            // ✅ Ensure this is defined BEFORE use
            const downloadsPath = await window.desk.api.getDownloadsPath();
            await window.desk.api.saveAndOpenImage(downloadsPath, dataUrl);
        })
        .catch((error) => {
            console.error('Error creating image:', error);
            window.ModalManager.hideLoader()

        });

        window.ModalManager.hideLoader()

}

export function getParents(event, levels = 3) {
    let current = event.target;
    for (let i = 1; i <= levels; i++) {
        if (current.parentNode) {
            current = current.parentNode;
            //console.log(`Level ${i} Parent:`, current);
        } else {
            //console.log(`No more parents at level ${i}`);
            break;
        }
    }
    return current;
}


export function toggleExportOptions(id, state = null) {
    const exportMenu = document.getElementById(`exportOptions-${id}`)

    if (!exportMenu) return

    if (state === "on") {
        return exportMenu.classList.remove('hidden');
    }
    else if (state === "off") {
        return exportMenu.classList.add('hidden');
    }
    else {
        return exportMenu.classList.toggle('hidden');
    }

}

document.addEventListener('keydown', (e) => {
    if (e.key === "Escape" && !e.shiftKey) {
        document.querySelectorAll(`[data-action^=export-menu]`)?.forEach(menu => {
            menu?.classList.add('hidden')
        })
    }
})


window.HTML2Word = HTML2Word;
window.HTML2Pdf = HTML2Pdf;
window.HTML2Jpg = HTML2Jpg;
window.toggleExportOptions = toggleExportOptions;

