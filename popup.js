const CurrentState = {};

chrome.storage.local.get(["WikiHelperisActive"]).then((result) => {
    Object.assign(CurrentState, result)
    const checkbox = document.getElementById('WikiHelperisActive');
    
    CurrentState?.WikiHelperisActive ? checkbox.checked = true : checkbox.checked = false;
    console.log(CurrentState);
    console.log(CurrentState?.WikiHelperisActive, 'WikiHelperisActive');
    
    checkbox.addEventListener('change', function() {
        chrome.storage.local.set({ WikiHelperisActive: this.checked })
        if(this.checked) {
            sendMsg({WikiHelperisActive: true});
        }
        else {
            sendMsg({WikiHelperisActive: false});
        }
    });

});

async function sendMsg(message) {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, message);
    console.log(response);
}
