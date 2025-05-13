const modelChange = new CustomEvent('ModelChange');
document.addEventListener('DOMContentLoaded', function() {
    for (const item of ['chatStore', 'keyshortcuts', 'preference', 'fileHandler', 'diagraming/visualUtils', 'diagraming/packed_visualDGRenderer', 'diagraming/packed_visualChartsRenderer', 'OpStatus', 'setup/setup', 'MathBase/packed_mathHandler', 'MathBase/MathNormalize']) {
        addScripts(item);
    }

    const modal = document.getElementById("settingsModal");
    const themeSwitch = document.getElementById("themeSwitch");
    const rootElement = document.documentElement;
    const scrollButton = document.getElementById("scroll-bottom");
    const chatArea = document.getElementById("chatArea");
    const moreButton = document.getElementById("more");
    const userInput = document.getElementById("userInput");
    const modelButton = document.getElementById('modelButton');
    const modelDropdown = document.getElementById('modelDropdown');
    const modelItems = document.querySelectorAll('[data-value]');
    const selectedModelText = document.getElementById('selectedModelText');
    const model = document.getElementById('model');

    // Query map for button actions
    const queryMap = {
        "get-advice": "Give me advice on financial literacy",
        "summarize": "Summarize the book Rich Dad Poor Dad in one page",
        "create-image": "/image Create an image of an eagle diving at supersonic speed to catch its prey",
        "suprise": "Surprise me with a story about yourself",
        "code": "Help me learn Python",
        "analyze-images": "Analyze the following images/translate the text in these images",
        "help-me-write": "Help me write a cover letter .."
    };

    // Function to hide the modal
    function hideModal() {
        modal.classList.add('hidden');
    }

    function addScripts(packed_script) {
        const script = document.createElement('script');
        script.src = `js/${packed_script}.js`;
        script.async = true; // Optional: load the script asynchronously
        document.body.appendChild(script);
        console.log(`Added ${packed_script} script`);
    }

    // Show settings modal when settings button is clicked
    document.getElementById('settings').addEventListener('click', () => {
        modal.classList.remove('hidden');
    });

    // Event listeners for hiding the modal
    document.getElementById('saveSettings').addEventListener('click', hideModal);
    document.getElementById("closeModal").addEventListener('click', hideModal);

    // Initialize theme based on user's previous preference or system preference
    const userTheme = localStorage.getItem("theme");
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const currentTheme = userTheme || systemTheme;

    // Set the initial theme
    setTheme(currentTheme);
    //Set code these styleSheet
    window.electron.addCodeThemeSheet(currentTheme);


    // Function to set the theme
    function setTheme(theme) {

        if (theme === "dark") {
            rootElement.classList.add("dark");
            themeSwitch.checked = true;
            window.isDark = true;
        } else {
            rootElement.classList.remove("dark");
            window.isDark = false;
        }

        window.electron.ThemeChangeDispatch()

        localStorage.setItem("theme", theme);
    }

    // Toggle theme on switch click
    themeSwitch.addEventListener("click", () => {
        const newTheme = rootElement.classList.contains("dark") ? "light" : "dark";
        setTheme(newTheme);
        window.electron.addCodeThemeSheet(newTheme);
    });

    // Function to update scroll button visibility
    function updateScrollButtonVisibility() {
        //console.log("Scrollable")
        const isScrollable = chatArea.scrollHeight > chatArea.clientHeight;
        const isAtBottom = chatArea.scrollTop + chatArea.clientHeight >= chatArea.scrollHeight;

        scrollButton.classList.toggle('hidden', !(isScrollable && !isAtBottom));
    }

    // Attach scroll event listener to chatArea
    chatArea.addEventListener("scroll", updateScrollButtonVisibility);
    chatArea.addEventListener("input", updateScrollButtonVisibility);
    window.addEventListener("resize", updateScrollButtonVisibility);

    // Initial check when content is loaded or dynamically updated
    updateScrollButtonVisibility();

    // Scroll to the bottom when the button is clicked
    scrollButton.addEventListener("click", () => {
        chatArea.scrollTo({
            top: chatArea.scrollHeight,
            behavior: "smooth",
        });
    });

    // Show hidden elements when "more" is clicked
    moreButton.addEventListener('click', () => {
        document.querySelectorAll(".extra").forEach(item => item.classList.remove('hidden'));
        moreButton.classList.add('hidden');
    });

    // Add event listeners to buttons using delegation
    document.getElementById('SQ-UL').addEventListener('click', (event) => {
        const target = event.target.closest('.SG'); // Find closest button clicked
        if (target) { // If a button was clicked
            const queryKey = target.id; // Get the ID of the button
            if (queryMap[queryKey]) {
                userInput.textContent = queryMap[queryKey]; // Set input area value based on queryMap
                userInput.focus(); // Focus on input area
            } else {
                console.warn(`No query found for key: ${queryKey}`);
            }
        }
    });


     function scrollToBottom(element) {
         // Use setTimeout to ensure the scroll happens after the DOM has updated
         setTimeout(() => {
             element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
         }, 0);
     }

     // Ensure the textarea is empty initially
     userInput.textContent = userInput.textContent.trim();
     // Trigger input event to adjust height
     userInput.dispatchEvent(new Event('input'));


     // handle new conversation logic
     function NewConversation(event){
        event.stopPropagation();
        event.preventDefault(); // Prevent any default action
        const ConversationEvent = new CustomEvent('NewConversationOpened');
        ClearChatArea()
        document.dispatchEvent(ConversationEvent)
     }

    // Handle new conversation button click
    document.getElementById('new-chat').addEventListener('click', function (event) {
        NewConversation(event);
    })

    window.scrollToBottom = scrollToBottom;

     // Set up the event listener
     window.electron.receive('fromMain', (data) => {
         //console.log(data)
         if (data.message === "set-Utitility-Script"){
            console.log('Message received:', data.message);
            try {
                window.electron.addUtilityScript();
                console.log("Utility script added successfully");
            } catch (err) {
                console.error("Error adding utility script:", err);
            }
         }
     });


     function ClearChatArea(){
         Array.from(chatArea.children).forEach((child) => {
             if (child.id !== 'suggestions') {
                 child.remove();
             }
             //console.log('opened new conversation')
             document.getElementById('suggestions') ? document.getElementById('suggestions').classList.remove('hidden') : "";
        });
     }

//Notify();


// Function to toggle dropdown visibility
function toggleDropdown() {
    modelDropdown.classList.toggle('hidden');
}

//Handle custom model selection
// Function to select a mode
function selectModel(value) {
    modelItems.forEach(item => {
        const isSelected = item.getAttribute('data-value') === value;
        item.classList.toggle('dark:bg-stone-900', isSelected);
        item.classList.toggle('bg-green-200', isSelected);
    });

    selectedModelText.innerText = model.options[model.selectedIndex].innerText;
    modelDropdown.classList.add('hidden');

    document.title = `QuickAI - ${model.value}`;

}

// Event listener for button click to toggle dropdown
modelButton.addEventListener('click', toggleDropdown);

// Event listener for clicking outside the dropdown to close it
document.addEventListener('click', function(event) {
    if (!modelButton.contains(event.target) && !modelDropdown.contains(event.target)) {
        modelDropdown.classList.add('hidden');
    }
});

// Event listener for selecting a mode
modelItems.forEach(item => {
    const visionModels = ["pixtral-12b-2409", "pixtral-large-2411", "mistral-small-latest", "Llama-3.2-11B-Vision-Instruct"]
    item.addEventListener('click', function() {
        const value = this.getAttribute('data-value');
        if (visionModels.includes(model.value) && !visionModels.includes(value)){
            document.dispatchEvent(modelChange);
            ClearChatArea();
        }
        model.value = value;
        selectModel(value);
    });
});

// Initial selection based on the select element's default value
selectModel(model.value);
window.selectModel = selectModel;

const animationToggle = document.getElementById('animation-toggle');

//Set animation on innitially
animationToggle.checked=true;

const animationTogglePeer = document.getElementById('animation-toggle-peer');
const bodyCanvas = document.getElementById('body-canvas');
animationTogglePeer.addEventListener('click', ()=>{
    if (animationToggle.checked !== true){
        bodyCanvas.classList.remove('hidden');
        window.electron.addScript('DotSphereAnim.js');
        //window.electron.AnimationReadyDispatch();
    }else{
        bodyCanvas.classList.add('hidden');
        window.electron.removeScript('DotSphereAnim.js');
    }
})
});

// Function to show the modal
function Notify(_color=null, time=null, text="") {
    const modal = document.getElementById('quickaiNotify');
    const message = document.getElementById('messageContent');
    const timeTaken = document.getElementById('timeTaken');
    if (text){
        message.innerText = text;
    } else if(time){
        timeTaken.innerText = time;
    }
    // Slide modal to 20% height and make it visible after 1 second
    setTimeout(() => {
        modal.classList.add('top-1/5', 'opacity-100', 'pointer-events-auto');
    }, 200); // 1 second delay

    // Slide modal to the left and fade out after 5 seconds
    setTimeout(() => {
        modal.classList.remove('top-1/5', 'left-1/2', '-translate-x-1/2');
        modal.classList.add('left-0', '-translate-x-full', 'opacity-0', 'pointer-events-none');

    }, 5000); // 4 seconds for staying in the middle

    // Reset transform after fully fading out and moving off-screen
    setTimeout(() => {
        modal.classList.remove('left-0', '-translate-x-full', 'opacity-0', 'pointer-events-none');
        modal.classList.add('top-0', 'left-1/2', '-translate-x-1/2', 'pointer-events-none');
    }, 1000); // 0.5s for fade out
}


// Function to toggle the fold/unfold of the think section
function toggleFold(event, selector) {
    const content = document.getElementById(selector);
    if (content) {
        content.classList.toggle('hidden');
    }
}
// Make toggleFold available to the window
window.toggleFold = toggleFold;

//Store Notify to window
window.Notify = Notify;
