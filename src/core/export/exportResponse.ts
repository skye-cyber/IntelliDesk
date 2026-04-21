/// <reference path="../../main/preload.type.ts" />
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toJpeg } from 'html-to-image';
import { saveAs } from 'file-saver';
import { modalmanager } from '../StatusUIManager/Manager';
import { globalEventBus } from '../Globals/eventBus';


// Fallback function to export as plain text
export function exportAsPlainText(element: HTMLBaseElement) {
    const textContent = element.innerText || element.textContent;
    const blob = new Blob([textContent], { type: 'text/plain' });
    saveAs(blob, 'output.txt');
}


export function HTML2Pdf(element: HTMLBaseElement, options: HTML2JPGOptionsType) {
    globalEventBus.emit('status:loading:show', "Exporting message to pdf...")

    setTimeout(() => {
        try {
            if (element) {
                console.log('Exporting to PDF...');

                html2canvas(element, {
                    backgroundColor: options.IsDarkTheme ? '#08011b' : 'white',
                }).then(canvas => {
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
                    console.error('Error creating PDF:', err);
                });
            }
        } catch (err) {
            console.log(err)
        } finally {
            globalEventBus.emit('status:loading:hide')
        }
    }, 0)
}

interface HTML2JPGOptionsType {
    IsDarkTheme: boolean
}

export function HTML2Jpg(element: HTMLBaseElement, options: HTML2JPGOptionsType) {
    globalEventBus.emit('status:loading:show', "Exporting message to jpg...")
    setTimeout(() => {
        try {
            if (!element) {
                console.error('Element not found');
                return;
            }
            const width = element.offsetWidth;
            const height = element.offsetHeight;

            toJpeg(element, {
                width,
                height,
                quality: 0.95,
                cacheBust: true,
                backgroundColor: options.IsDarkTheme ? '#08011b' : 'white',
                style: { 'padding': '12px' }
            })
                .then(async (dataUrl) => {
                    const downloadsPath = window.desk.api.getDownloadsPath();
                    window.desk.api.saveAndOpenImage(downloadsPath, dataUrl);
                })
                .catch((error) => {
                    console.error('Error creating image:', error);
                }).finally(() => modalmanager.hideLoader())
        } finally {
            globalEventBus.emit('status:loading:hide')
        }
    }, 0)
}

