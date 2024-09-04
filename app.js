const CurrentState = {};

var orphanMessageId = chrome.runtime.id + 'orphanCheck';
window.dispatchEvent(new Event(orphanMessageId));
window.addEventListener(orphanMessageId, unregisterOrphan);
chrome.runtime.onMessage.addListener(onMessage);

chrome.storage.local.get(["WikiHelperIsCutActive"]).then((result) => {
    Object.assign(CurrentState, result)
    if (CurrentState?.WikiHelperIsCutActive) addEventOnCopy()
});

function CopyEventHandler(e) {
    // DOM events still fire in the orphaned content script after the extension
    // was disabled/removed and before it's re-enabled or re-installed
    if (unregisterOrphan()) { return }
    var text = window.getSelection().toString().trim();
    e.clipboardData.setData('text/plain', text);
    e.preventDefault();
}

function addEventOnCopy() { document.addEventListener('copy', CopyEventHandler) }

function removeEventOnCopy() { document.removeEventListener('copy', CopyEventHandler) }

function onMessage(message, sender, sendResponse) {
    if (message.WikiHelperIsCutActive) addEventOnCopy()
    else removeEventOnCopy();
}

function unregisterOrphan() {
    if (chrome.runtime.id) {
      // someone tried to kick us out but we're not orphaned! 
      return;
    }
    window.removeEventListener(orphanMessageId, unregisterOrphan);
    removeEventOnCopy();
    try {
      // 'try' is needed to avoid an exception being thrown in some cases 
      chrome.runtime.onMessage.removeListener(onMessage);
    } catch (e) {}
    return true;
  }