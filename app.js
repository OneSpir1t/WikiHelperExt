const CurrentState = {};

chrome.storage.local.get(["WikiHelperisActive"]).then((result) => {
    Object.assign(CurrentState, result)
    console.log(CurrentState?.WikiHelperisActive, 'WikiHelperisActive');
    
    if (CurrentState?.WikiHelperisActive) {
        addEventOnCopy()
    }
});

function handleCopyEvent(e) {
    var text = window.getSelection().toString().trim();
    e.clipboardData.setData('text/plain', text);
    e.preventDefault();
}

function addEventOnCopy() {
    document.addEventListener('copy', handleCopyEvent);
}

function removeEventOnCopy() {
    document.removeEventListener('copy', handleCopyEvent);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.WikiHelperisActive) addEventOnCopy()
    else removeEventOnCopy();
});