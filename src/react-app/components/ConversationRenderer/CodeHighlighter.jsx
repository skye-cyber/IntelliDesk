import { marked } from "marked";
import hljs from 'highlight.js';


// Initialize highlight.js
hljs.configure({ ignoreUnescapedHTML: true });

export const markitdown = marked

const renderer = new marked.Renderer();
renderer.code = function(code) {

    // Handle case where `code` is an object
    let valid_language = code.lang || 'plaintext';

    if (typeof code === "object" && code.text !== undefined) {
        code = code.text; // Extract the actual code
    }

    if (typeof code !== "string" || code.trim() === "") {
        console.warn("Empty or invalid code provided:", code);
        code = "// No code provided"; // Default fallback for empty code

    }

    let dgCodeBlock =
        ['dot-draw', 'json-draw', 'json-chart'].includes(valid_language)
            ? true
            : false;

    let dg_lang = dgCodeBlock ? valid_language : null;

    valid_language = (
        dg_lang
            ?
            (['json', 'dot'].includes(dg_lang)
                ? valid_language.slice(0, -5)
                : valid_language.slice(0, -6)
            )
            : valid_language
    )

    // Highlight the code
    let highlighted;

    try {

        highlighted = hljs.highlight(code, { language: valid_language }).value;

    } catch (error) {
        if (error.message === "Unknown language") {
            //console.log("Undetermined language")
        }
        else {
            //console.error("Highlighting error:", error.name);
            highlighted = hljs.highlightAuto(code).value; // Fallback to auto-detection
        }
    }

    // Reset language to json-draw
    valid_language = dg_lang ? dg_lang : valid_language

    return `<<<CODE_BLOCK|${highlighted}|${valid_language}END_BLOCK>>>`;
};

marked.setOptions({
    renderer: renderer,
    breaks: true,
});


