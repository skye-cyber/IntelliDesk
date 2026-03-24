// style hljs
const hljsElements = document.querySelectorAll('.hljs');
hljsElements.forEach(element => {
    //element.style.background = '';
    //element.classList.add('rounded-md', 'font-mono', 'bg-blue-400')
})


async function setModel(modelName = 'mistral-large-latest', initial = false) {
    // Set default model to codestral-latest
    const defaultModel = document.querySelector(`[data-value="${modelName}"]`);

    if (defaultModel) {  // Check if element exists
        if (initial) {
            setTimeout(() => {
                defaultModel.click();  // Added parentheses for method call
                //console.log(document.getElementById('model').value)
                return true
            }, 10);
        } else {
            defaultModel.click();
            return true
        }
    } else {
        console.error(`Element with data-value="${modelName}t" not found!`);
        return false
    }
}

async function setAllLinkstoblank() {
    //
}
//set default model
setModel(modelNmae = 'mistral-large-latest', initial = true)

window.setModel = setModel;

// Activate canvas initially
setTimeout(() => {
    canvasDSP()
}, 300)
