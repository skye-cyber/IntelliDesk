
// ------Implement user preference handling ------
const prefContent = document.getElementById('pref-content');
const prefInput = document.getElementById('pref-input');
const prefPrevSection = document.getElementById('pref-section');
const prefEdit = document.getElementById('pref-edit');
const prefDelete = document.getElementById('pref-delete');
const prefSubmit = document.getElementById('pref-submit');
const prefInputSection = document.getElementById('pref-inputSection');

// Always hide input section when prefContent has value
if (prefContent.innerText) {
    prefInputSection.classList.add('hidden');
} else if (!prefContent.innerText) {
    prefPrevSection.classList.add('hidden');
}
//Add event listener for Pref submission
//-------------Button---------------
prefSubmit.addEventListener("click", () => {
    const inputText = prefInput.value.trim();
    if (inputText && inputText.length > 10) {
        prefInput.value = "";
        // Dispatch Save event
        window.electron.savePreference(inputText)
        prefInputSection.classList.add('hidden'); //hide input section
        prefContent.innerText = inputText; //Update preference content
        prefPrevSection.classList.remove('hidden');
    }
});

//-------------Enter key---------------
prefInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        const inputText = prefInput.value.trim();
        if (inputText && inputText.length > 10) {
            prefInput.value = "";
            // Dispatch Save event
            window.electron.savePreference(inputText)
            prefInputSection.classList.add('hidden'); //hide input section
            prefContent.innerText = inputText; //Update preference content
            prefPrevSection.classList.remove('hidden');
        }
    }
});

//Add event listener for edit
prefEdit.addEventListener('click', function() {
    prefInputSection.classList.remove('hidden'); //Show input section
    prefInput.value = prefContent.innerText;
    prefEdit.focus() //Focus text area for editing
    prefPrevSection.classList.add('hidden'); //Hide preference display block
    prefInput.style.height = Math.min(prefInput.scrollHeight, 0.28 * window.innerHeight) + 'px';
})

//Add event listener for Delete
prefDelete.addEventListener('click', function() {
    prefEdit.focus() //Focus text area for editing
    DeletePref();
})

async function DeletePref() {
    if (await window.electron.deletePreference()) {
        prefPrevSection.classList.add('hidden'); //Hide preference display block
        prefInputSection.classList.remove('hidden'); //Show input section
        prefInput.value = "";
    } else {
        const errorContainer = document.getElementById('errorContainer');
        const errorArea = document.getElementById('errorArea');
        errorArea.textContent = "Failed to delete preferences!"
        errorContainer.classList.remove('hidden');
        setTimeout(() => {
            errorContainer.classList.add('hidden');
        }, 3000)
    }
}
// Retrieve preferences
async function displayPref() {
    const pref = await window.electron.getPreferences()

    if (pref) {
        prefContent.innerText = pref;
        prefPrevSection.classList.remove('hidden'); //Hide preference display block
        prefInputSection.classList.add('hidden'); //Show input section
    }
}

//Ensure that the imag prompt is initially empty
document.getElementById('imagePrompt').value = "";
//Load preferences
displayPref();
