import { Mistral } from '@mistralai/mistralai';

const apiKey = process.env.MISTRAL_API_KEY;
const client = new Mistral({apiKey: apiKey});

const ocrResponse = await client.ocr.process({
    model: "mistral-ocr-latest",
    document: {
            type: "document_url",
        documentUrl: "https://arxiv.org/pdf/2201.04234"
    },
    includeImageBase64: true
});

//OCR with uploaded PDF
import fs from 'fs';

const uploadedFile = fs.readFileSync('uploaded_file.pdf');
const uploadedPdf = await client.files.upload({
    file: {
        fileName: "uploaded_file.pdf",
        content: uploadedFile,
    },
    purpose: "ocr"
});


//Retrieve File
const retrievedFile = await client.files.retrieve({
    fileId: uploadedPdf.id
});
//output
/*id='00edaf84-95b0-45db-8f83-f71138491f23' object='file' size_bytes=3749788 created_at=1741023462 filename='uploaded_file.pdf' purpose='ocr' sample_type='ocr_input' source='upload' deleted=False num_lines=None*/

//Get OCR results
const ocrResponse = await client.ocr.process({
    model: "mistral-ocr-latest",
    document: {
        type: "document_url",
        documentUrl: signedUrl.url,
    }
});


//OCR with image
import { Mistral } from '@mistralai/mistralai';

const apiKey = process.env.MISTRAL_API_KEY;
const client = new Mistral({apiKey: apiKey});

const ocrResponse = await client.ocr.process({
    model: "mistral-ocr-latest",
    document: {
        type: "image_url",
        imageUrl: "https://raw.githubusercontent.com/mistralai/cookbook/refs/heads/main/mistral/ocr/receipt.png",
    }
});


//Document understanding
import { Mistral } from "@mistralai/mistralai";
// import fs from 'fs';

// Retrieve the API key from environment variables
const apiKey = process.env["MISTRAL_API_KEY"];

const client = new Mistral({
    apiKey: apiKey,
});

// If local document, upload and retrieve the signed url
// const uploaded_file = fs.readFileSync('uploaded_file.pdf');
// const uploaded_pdf = await client.files.upload({
//     file: {
//         fileName: "uploaded_file.pdf",
//         content: uploaded_file,
//     },
//     purpose: "ocr"
// });
// const signedUrl = await client.files.getSignedUrl({
//     fileId: uploaded_pdf.id,
// });

const chatResponse = await client.chat.complete({
    model: "mistral-small-latest",
    messages: [
        {
            role: "user",
            content: [
                {
                    type: "text",
                    text: "what is the last sentence in the document",
                },
                {
                    type: "document_url",
                    documentUrl: "https://arxiv.org/pdf/1805.04770",
                    // documentUrl: signedUrl.url
                },
            ],
        },
    ],
});

console.log("JSON:", chatResponse.choices[0].message.content);
