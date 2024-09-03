const CurrentState = {};

chrome.storage.local.get(["WikiHelperisActive"]).then((result) => {
    Object.assign(CurrentState, result)
    console.log(CurrentState?.WikiHelperisActive, 'WikiHelperisActive');
    
    if (CurrentState?.WikiHelperisActive) {
        addEventOnCopy()
    }
});

function addEventOnCopy() {
    document.addEventListener('copy', function(e){
        var text = window.getSelection().toString().trim();
        e.clipboardData.setData('text/plain', text);
        e.preventDefault();
    });
    //console.log('eventAdded');
}

function removeEventOnCopy() {
    document.removeEventListener('copy', addEventOnCopy);
    //console.log('eventRemoved');
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.WikiHelperisActive) addEventOnCopy()
    else removeEventOnCopy();
});