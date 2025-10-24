async function displayStatus(message=null, type='success'){
    const modal = type==='success' ? document.getElementById('success-modal-GN') : document.getElementById('errorModal-GN');
    const box = type==='success' ? document.getElementById('successBoxBody-GN') : document.getElementById('errorBox-GN');
    if(message){
        const mesSection = type==='success' ? document.getElementById('SuccessMsg-GN') : document.getElementById('error-message-GN');
        mesSection.textContent = message;
    }
    modal.classList.remove('hidden');
    box.classList.remove('animate-exit');
    box.classList.add('animate-enter')
    return true
}

async function hideStatus(type){
    const modal = type==='success' ? document.getElementById('success-modal-GN') : document.getElementById('errorModal-GN');
    const box = type==='success' ? document.getElementById('successBoxBody-GN') : document.getElementById('errorModal-GN');

    box.classList.remove('animate-enter')
    box.classList.add('animate-exit');
    setTimeout( ()=> {
        modal.classList.add('hidden');
    }, 310)
    return true
}

async function HandleLoading(task, message=null){
    const loadingModal = document.getElementById('loadingModal');
    const modalMainBox = document.getElementById('modalMainBox');
    if (task==="show"){
        if (message){
            const msgBox = document.getElementById('loadingMSG');
            msgBox.textContent = message;
        }
        loadingModal.classList.remove('hidden');
        modalMainBox.classList.remove('animate-exit');
        modalMainBox.classList.add('animate-enter')
    }else{
        modalMainBox.classList.remove('animate-enter')
        modalMainBox.classList.add('animate-exit');
        setTimeout( ()=> {
            loadingModal.classList.add('hidden');
        }, 310)
    }
    return true
}

//Hide success modal of ok click
/*const closeSuccess = document.getElementById('CloseSucsessModal')
 * closeSuccess.addEventListener('click', ()=>{
 *    hideStatus(type='success')
 * });*/

window.displayStatus=displayStatus;
window.hideStatus=hideStatus;
window.HandleLoading = HandleLoading;
