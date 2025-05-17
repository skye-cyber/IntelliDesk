const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const modelSelection = document.getElementById('model');

const AllVisionModels = [
    "mistral-small-latest",
    "pixtral-12b-2409",
    "pixtral-large-2411",
    "Qwen/Qwen2-VL-7B-Instruct",
    "meta-llama/Llama-3.2-11B-Vision-Instruct",
    "Qwen/QVQ-72B-Preview"
]

sendBtn.addEventListener("click", () => {
    const inputText = userInput.innerHTML.trim();
    if (inputText) {
        // Reset the input field
        userInput.innerHTML = "";
        // Adjust input field height
        userInput.style.height = 'auto';
        userInput.style.height = Math.min(userInput.scrollHeight, 0.28 * window.innerHeight) + 'px';
        userInput.scrollTop = userInput.scrollHeight;
        requestRouter(inputText);
        document.getElementById('suggestions').classList.add('hidden');
    }
});

userInput.addEventListener("keydown", (e) => {
    // When sendBtn is visible and the user presses Enter without shift
    if (!sendBtn.classList.contains('hidden') && e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const inputText = userInput.innerHTML.trim();
        if (inputText) {
            userInput.innerHTML = "";
            userInput.style.height = 'auto';
            userInput.style.height = Math.min(userInput.scrollHeight, 0.28 * window.innerHeight) + 'px';
            userInput.scrollTop = userInput.scrollHeight;
            requestRouter(inputText);
            const suggestionsEl = document.getElementById('suggestions');
            if (suggestionsEl) suggestionsEl.classList.add('hidden');
        }
    }
});


async function switchToVision() {
    // switch to vision model
    if (AllVisionModels.length > 0) {
        if (!AllVisionModels.includes(modelSelection.value)) {
            const res = await window.setModel('mistral-small-latest')
            return res
        }
    } else {
        console.warn("AllVisionModels is empty.");
    }
}

async function getModelValue() {
    return document.getElementById('model').value
}

async function chooseRoute() {
    //document.querySelector(`[data-value="mistral-small-latest"]`).click();
    const fileDataUrl = event.detail.fileDataUrl;
    const text = event.detail.text;
    const fileType = event.detail.fileType

    // Define the set of models that should use MistraVision
    const mistralModels = ["pixtral-12b-2409", "pixtral-large-2411", "mistral-small-latest"];

    //switch to vision model
    const res = await switchToVision()

    const modelName = await getModelValue();

    if (!res===true){
        console.log('fail')
    }

    if (mistralModels.includes(modelName)) {
        window.MistraVision(text, fileType, fileDataUrl, modelName);
    } else {
        window.VisionChat(text, fileType, fileDataUrl, null);
    }
}

// Listen for the imageLoaded event
document.addEventListener('imageLoaded', async (event) => {await chooseRoute(event);});

/**
 * Classify the input text by checking the current model category and
 * then route to the appropriate function.
 */
function requestRouter(text) {
    const modelName = modelSelection.value;

    console.log("✅Reached Target requestRouter:")
    // Get the currently selected option
    const selectedOption = modelSelection.options[modelSelection.selectedIndex];

    // Get the data-class attribute from the selected option
    const dataClass = selectedOption.getAttribute('data-class');

    //Intercept image generation
    if (window.imageGen){
        console.log('Image GEN')

        const imageGen = new window.ImageGenerator(chatArea);
        imageGen.createImage(text)
    }
    //console.log("DataClass:", dataClass); // This will log the value of the data-avalue attribute
    else if (dataClass === "hf") {
        window.routeToHf(text);
    } else if (dataClass === "mistral") {
        window.routeToMistral(text, modelName);
    } else {
        console.warn("⚠️Unrecognized dataClass from the selected model!")
    }
}

window.requestRouter = requestRouter;
