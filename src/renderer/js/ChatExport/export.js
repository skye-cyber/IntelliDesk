import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toJpeg } from 'html-to-image';
import { saveAs } from 'file-saver';
import { modalmanager } from '../StatusUIManager/Manager';

export async function HTML2Word(event, element) {
    event.preventDefault();

    modalmanager.startLoader("Exporting message to word...")

    try {
        if (element) {
            console.log('Exporting to Word...');


            // Import the entire module and access what you need
            const htmlToDocxModule = await import('html-to-docx');

            // Try different ways to access the function
            const htmlToDocx = htmlToDocxModule.default || htmlToDocxModule;

            const docx = await htmlToDocx(element.outerHTML);
            saveAs(docx, 'output.docx');

        } else {
            console.error('Element not found for the given selector:', selector);
        }
    } catch (err) {
        console.log(err)
        //exportAsPlainText(element);
    } finally {
        modalmanager.hideLoader()
    }
}


// Fallback function to export as plain text
export function exportAsPlainText(element) {
    const textContent = element.innerText || element.textContent;
    const blob = new Blob([textContent], { type: 'text/plain' });
    saveAs(blob, 'output.txt');
}


export function HTML2Pdf(event, element) {
    event.preventDefault(); // Prevent the default action of the anchor tag
    modalmanager.startLoader("Exporting message to pdf...")

    try {
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
                modalmanager.hideLoader()
                console.error('Error creating PDF:', err);
            });
        } else {
            console.error('Element not found for the given selector:', selector);
        }
    } catch (err) {
        console.log(err)
    } finally {
        modalmanager.hideLoader()
    }
}

export function HTML2Jpg(event, element) {
    event.preventDefault();

    modalmanager.startLoader("Exporting message to jpg...")

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
        }).finally(() => modalmanager.hideLoader())
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

