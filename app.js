const CurrentState = {};
const NameVersions = [];

var orphanMessageId = chrome.runtime.id + 'orphanCheck';
window.dispatchEvent(new Event(orphanMessageId));
window.addEventListener(orphanMessageId, unregisterOrphan);
chrome.runtime.onMessage.addListener(onMessage);

chrome.storage.local.get(["WikiHelperIsCutActive", "WikiHelperOldVSettings", "WikiHelperNewVSettings"]).then((result) => {
  Object.assign(CurrentState, result);
  if (CurrentState?.WikiHelperIsCutActive) addEventOnCopy();
  if(CurrentState?.WikiHelperOldVSettings && CurrentState?.WikiHelperNewVSettings) InitVersionsAttention();
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
  if (message.WikiHelperIsCutActive) addEventOnCopy();
  if (!message.WikiHelperIsCutActive) removeEventOnCopy();
  if (message.WikiHelperOldVSettings || message.WikiHelperNewVSettings) InitVersionsAttention();
}

function unregisterOrphan() {
  if (chrome?.runtime?.id) {
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

async function InitVersionsAttention() {
  const result = await chrome.storage.local.get(["WikiHelperOldVSettings", "WikiHelperNewVSettings"]);
  Object.assign(CurrentState, result);
  for (var v in CurrentState.WikiHelperNewVSettings){
    if(!NameVersions.includes(v)) NameVersions.push(v);
  }
  const FirstParagraph = document.getElementById('mw-content-text');
  const LibName =  FirstParagraph?.firstElementChild?.firstElementChild?.innerText;
  VersionsAttention(LibName);
}

function VersionsAttention(LibName) {
  if(!NameVersions.includes(LibName)) return;
  const OldV = CurrentState.WikiHelperOldVSettings[LibName];
  const NewV = CurrentState.WikiHelperNewVSettings[LibName];
  const h3s = [...document.querySelectorAll('h3')];
  const newVersionEl = h3s.find(elem => isCasts(elem, NewV));
  if(newVersionEl){
    const siblings = [...newVersionEl.parentNode.children].filter(elem => elem.id != 'toc');
    siblings.forEach(elem => {
      elem.style.background = '#ffffff';
    })
    const indexOfFirstH3 = siblings.findIndex(elem => isCasts(elem, NewV));
    const indexOfSecondH3 =  siblings.findIndex(elem => isCasts(elem, OldV));
    const betweenELems = siblings.slice(indexOfFirstH3 + 1, indexOfSecondH3);
    const anchors = document.getElementsByClassName('toctext');
    for (let i = 0; anchors.length > i; i++){
      anchors[i].style.color = '#0645ad';
      if (isCasts(anchors[i], NewV) || isCasts(anchors[i], OldV)) anchors[i].parentElement.style.background = '#DDFC74';
    }
    if (indexOfFirstH3 > indexOfSecondH3) return;
    if (indexOfFirstH3 > 0) siblings[indexOfFirstH3].style.background = '#714955';
    if (indexOfSecondH3 > 0) siblings[indexOfSecondH3].style.background = '#714955';

    if (indexOfFirstH3 > 0 && indexOfSecondH3 > 0) {
      betweenELems.forEach(elem => {
        elem.style.background = '#A0ECD0';
      })
    }
  } else console.log('newVEl not founded');
}

function isCasts(element, version) {
  if(element.innerText) {
    const TextArea = element.innerText.replaceAll('[править]', '').split('-');  
    let finded = false;
    TextArea.forEach(elem => {
      if(elem.trim() === 'Версия ' + version || elem.trim() === version) finded = true; 
    })
    return finded;
  }
  else return false;
}