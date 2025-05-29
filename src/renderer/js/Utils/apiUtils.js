

function toggleVisibility(id) {
    const input = document.getElementById(id);
    input.type = input.type === 'password' ? 'text' : 'password';
}

function showApiQueryModal(){
    const modal = document.getElementById('apiKeyModal');
    const modalContent = document.getElementById('apiKeyModalContent');
    modal.classList.remove('hidden');
    modalContent.classList.remove('animate-exit');
    modalContent.classList.add('animate-enter');
}

function closeApiQueryModal() {
    const mistralApiValue = document.getElementById('mistralKeyMan').value;
    const hfApiValue = document.getElementById('huggingfaceKeyMan').value;
    if (!mistralApiValue && !hfApiValue){
        showApiNotSetWarning();
    }
    const modal = document.getElementById('apiKeyModal');
    const modalContent = document.getElementById('apiKeyModalContent');

    modalContent.classList.remove('animate-enter');
    modalContent.classList.add('animate-exit');
    setTimeout(()=>{
        modal.classList.add('hidden');
    }, 300);
}

const manPagemodal = document.getElementById('apiKeyManPage')

function showApiManModal(){
    manPagemodal.classList.remove('translate-y-full');
    manPagemodal.classList.add('translate-y-1');
}


function hideApiManModal(){
    manPagemodal.classList.add('translate-y-full');
    manPagemodal.classList.remove('translate-y-1');
}

const manPageCloseBt = document.getElementById('closeModalManPage');
manPageCloseBt.addEventListener('click', ()=>{
    manPagemodal.classList.remove('translate-y-1');
    manPagemodal.classList.add('translate-y-full')
})

// Save keys using keytar via the preload API
async function saveKeys(task="save") {
    let mistralKey = (task === "save") ? document.getElementById('mistralKey').value : document.getElementById('mistralKeyMan').value;
    let huggingfaceKey = (task === "save") ? document.getElementById('mistralKey').value : document.getElementById('huggingfaceKeyMan').value;

    // Only update changed/edited fields, marked by mask *
    mistralKey = mistralKey.includes('*') ? null : mistralKey;
    huggingfaceKey = huggingfaceKey.includes('*') ? null : huggingfaceKey;

    const keyStore = { mistralKey, huggingfaceKey }

    //console.log(keyStore);

    // Exit if no changes were made
    if (!keyStore){
        return
    }

    if (mistralKey || huggingfaceKey){
        const result = await window.api.saveKeys(keyStore);
        if (result.success) {
            //Load keys after saving
            loadKeys();

            //Close warning modals
            closeWarningModal();
            closeApiNotSetWarning();

            //Close Api query modal
            closeApiQueryModal();

            // if taskis update, close manpage modal
            (task==="update") ? hideApiManModal() : '';

            SuccessModal('show', 'Keys saves successfully. Please Restart the App', 5000);
        }
    }else{
        console.log('No keys set')
        showApiNotSetWarning();
    }

}


// Load keys from keytar via the preload API and mask them
async function loadKeys() {
    const mistralApiField = document.getElementById('mistralKeyMan');
    const hfApiField = document.getElementById('huggingfaceKeyMan');

    const { mistralKey, huggingfaceKey } = await window.api.getKeys() || {};

    //console.log('keys:', mistralKey, huggingfaceKey)
    if (!mistralKey && !huggingfaceKey){
        mistralApiField.value = "";
        hfApiField.value = "";
        showWarningModal();
        //showApiQueryModal();
    }else{
        mistralApiField.value = mistralKey ? maskKey(mistralKey) : '';
        hfApiField.value = huggingfaceKey ? maskKey(huggingfaceKey) : '';
    }
}


// Simple masking function: show only the last 4 characters
function maskKey(key) {
    const visibleChars = 4;
    const maskedSection = '*'.repeat(Math.max(0, key.length - visibleChars));
    const visibleSection = key.slice(-visibleChars);
    return maskedSection + visibleSection;
}

// Reset keys (clear inputs)
function resetKeys() {
    document.getElementById('mistralKey').value = '';
    document.getElementById('huggingfaceKey').value = '';
}

function openApiModal() {
    document.getElementById('apiKeyModal').classList.remove('hidden');
}


function resetKeys() {
    document.getElementById('mistralKey').value = " ";
    document.getElementById('huggingfaceKey').value = " ";
    document.getElementById('saveKeysBt').click;
}

function showWarningModal() {
    // Logic to show the warning modal
    const warningModal = document.getElementById('warningModal');
    const warningModalContent = document.getElementById('warningModalContent');

    warningModal.classList.remove('hidden', 'pointer-events-none');

    warningModal.classList.add('pointer-events-auto');

    warningModalContent.classList.remove('animate-exit');
    warningModalContent.classList.add('animate-enter');
}

function closeWarningModal() {
    const warningModal = document.getElementById('warningModal');
    const warningModalContent = document.getElementById('warningModalContent');

    warningModalContent.classList.remove('animate-enter', 'pointer-events-auto');

    warningModalContent.classList.add('animate-exit');

    setTimeout(()=>{
        warningModal.classList.add('hidden', 'pointer-events-none');
    })
}

function showApiNotSetWarning(){
    const ApiwarnModal = document.getElementById('ApiNotSetModal');
    const ApiWarnContent = document.getElementById('ApiNotSetContent');
    ApiwarnModal.classList.remove('hidden');
    ApiWarnContent.classList.remove('animate-exit');
    ApiWarnContent.classList.add('animate-enter')
}

function closeApiNotSetWarning(){
    const ApiwarnModal = document.getElementById('ApiNotSetModal');
    const ApiWarnContent = document.getElementById('ApiNotSetContent');
    ApiWarnContent.classList.remove('animate-enter');
    ApiWarnContent.classList.add('animate-exit');
    setTimeout( ()=>{
        ApiwarnModal.classList.add('hidden');
    }, 300)
}

function SuccessModal(action="close", message=null, timeout=null, restart=false){
    const msgSection = document.getElementById('success-message');
    const sucessModal = document.getElementById('successModal');
    const modalBox = document.getElementById('successModalContent');

    //Deactivate restart button if restart not required
    (restart===true) ? document.getElementById('restartBt').classList.remove('hidden') : '';

    if (action === "show"){
        if (message){
            msgSection.textContent = message;
        }
        sucessModal.classList.remove('hidden', 'animate-exit');
        modalBox.classList.remove('hidden', 'pointer-events-none');
        modalBox.classList.add('animate-enter');

        //Close modal after timeout if provided
        if (timeout){
            setTimeout(()=>SuccessModal('close'),timeout);
        }
    }else{
        msgSection.textContent = 'Operation Succeeded';
        modalBox.classList.remove('animate-enter');
        modalBox.classList.add('animate-exit');
        setTimeout(()=>sucessModal.classList.add('hidden', 'pointer-events-none'), 300);
    }
}

document.addEventListener('DOMContentLoaded', loadKeys);
window.SuccessModal = SuccessModal;
