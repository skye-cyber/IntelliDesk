## HOW TO DEAL WITH NON-TEXT DOCUMENTS/FILES -- BINARY FILES
> When you encounter documents--binary that cannot be directly read you may:
1. Convert them files to readable format before reading
2. Perform ocr on them

## Suggested tools/commands
1. `filewarp`

# filewarp Usage
A Python file **conversion**, **manipulation**, and **analysis** toolkit.
This is a Linux command-line interface (CLI) utility that converts documents from one format to another, analyzes files, manipulates files, and more.

- Name variations for the command
```shell
filewarp -h
```
- To run the CLI app, use the following command:

```shell
filewarp [OPTIONS] COMMAND [ARGS]...
```

Replace `[OPTIONS]` with global options and `COMMAND` with the specific operation you want to execute.

## Available Commands

| Command | Description |
|---------|-------------|
| `convert-doc` | Convert documents between formats (PDF, DOCX, etc.) |
| `convert-audio` | Convert audio files between formats (MP3, WAV, etc.) |
| `convert-video` | Convert video files between formats (MP4, MKV, etc.) |
| `convert-image` | Convert image files between formats (PNG, JPG, etc.) |
| `ocr` | Extract text from images using OCR |
| `pdf-join` | Join multiple PDF files |
| `extract-audio` | Extract audio from video files |
| `extract-pages` | Extract specific pages from PDF |
| `extract-images` | Extract images from PDF |
| `scan-pdf` | Scan PDF and extract text |
| `scan-as-image` | Scan PDF as images then extract text |
| `scan-long` | Scan document as long image (effective for complex layouts) |
| `pdf2long-image` | Convert PDF to long image |
| `doc-to-image` | Convert documents to images |
| `images-to-pdf` | Convert images to PDF |
| `images-to-word` | Convert images to Word document |
| `grayscale` | Convert images to grayscale |
| `resize-image` | Resize or compress images |
| `join-audio` | Join multiple audio files into one |
| `analyze-video` | Analyze video file properties |
| `edit-video` | Edit videos (trim, cut, etc.) |
| `convert-svg` | Convert SVG files to other formats |
| `html2word` | Convert HTML files to Word documents |
| `markdown2word` | Convert Markdown to Word with Mermaid rendering |
| `text2word` | Convert styled text to Word document |
| `record` | Record audio from microphone |
| `voice-type` | Use voice to type text |
| `audio-effects` | Apply audio effects and voice changes |

## Examples

### 1. Document Conversion

```shell
filewarp convert-doc example.docx --to pdf
```
- More clearly
```bash
╭───────────────┬───────────────────────────┬───────────────────────────────────────────╮
│ Command       │ Description               │ Example                                   │
├───────────────┼───────────────────────────┼───────────────────────────────────────────┤
│ convert-doc   │ Convert documents         │ filewrap convert-doc file.docx --to pdf   │
│ convert-audio │ Convert audio files       │ filewrap convert-audio song.mp3 --to wav  │
│ convert-video │ Convert videos            │ filewrap convert-video video.mp4 --to mkv │
│ convert-image │ Convert images            │ filewrap convert-image photo.jpg --to png │
│ ocr           │ Extract text from images  │ filewrap ocr image.png                    │
│ pdf-join      │ Join PDF files            │ filewrap pdf-join file1.pdf file2.pdf     │
│ --help        │ Show help for any command │ filewrap convert-doc --help               │
╰───────────────┴───────────────────────────┴───────────────────────────────────────────╯
```

### 2. Extracting text from PDF files
```bash
filewarp scan-long /path/to/pdf.pdf # First converts the pdf to long image
filewarp scan-as-image /path/to/pdf.pdf # Performs OCR by convert each page to image them merging text
filewarp convert-doc /path/to/file --to text # Convert PDF DOC, DOCS to text file
```
> Note that scan is reliable where pdf has images while convert-do --to txt is suitable when pdf is non image based
- For multiple related pdf file you may join the then operate on them as 1 file
**Example**
```bash
filewarp pdf-join file1.pdf file2.pdf
filewarp scan-as-image file1file2.pdf
```

## Operations output
- Generally output is place in the same directory with identical or variation of the input file name
- Joined file may have joined name eg `fil1file.{ext}`
- The cli may output location of the output file

## Important Notes
- For the first run the cli tool `filewarp` may take loger to start, incase you encouter timeout issue, call it with increase timeout
