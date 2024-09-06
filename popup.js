const CurrentState = {};
const controls = {};

document.addEventListener('DOMContentLoaded', () => {

    setControls();

    if(!controls.content) return;

    chrome.storage.local.get(["WikiHelperIsCutActive", "WikiHelperIsToggled", "WikiHelperOldVSettings", "WikiHelperNewVSettings", "WikiHelperOldVText", "WikiHelperNewVText"]).then((result) => {
        Object.assign(CurrentState, result);
        ManiSettingsInit();
        versionSettingInit();
        verticalTextBoxesSettingsInit()
        hidePreLoader();
    });
});

function sendMsg(message) {
    chrome.tabs.query({ url: "http://wiki.lex.lan/*" }).then((tabQuery) => {
        if(!tabQuery || !isValidChromeRuntime()) return;
        tabQuery.forEach(element => {
            chrome.tabs.sendMessage(element.id, message);    
        });

    });
}

function ManiSettingsInit() {
    CurrentState?.WikiHelperIsCutActive ? controls.Cutcheckbox.checked = true : controls.Cutcheckbox.checked = false;
    controls.Cutcheckbox.addEventListener('change', CutcheckboxEventHandler);
}

function versionSettingInit(){
    if (CurrentState?.WikiHelperIsToggled) {
        controls.toggleButton.textContent = 'Развернуть';
        controls.versionsDiv.classList.toggle('collapsed');
    }
    controls.toggleButton.addEventListener('click', toggleButtonEventHandler);
}

function CutcheckboxEventHandler(){
    chrome.storage.local.set({ WikiHelperIsCutActive: this.checked })
    if(this.checked) sendMsg({ WikiHelperIsCutActive: true });
    else sendMsg({ WikiHelperIsCutActive: false });
}

function toggleButtonEventHandler() {
    controls.versionsDiv.classList.toggle('collapsed');

    // Changing the button text depending on the block status
    if (controls.versionsDiv.classList.contains('collapsed')) controls.toggleButton.textContent = 'Развернуть';
    else controls.toggleButton.textContent = 'Свернуть';

    if (controls.toggleButton.textContent === 'Развернуть') {
        chrome.storage.local.set({ WikiHelperIsToggled: true })
    }
    else chrome.storage.local.set({ WikiHelperIsToggled: false })
}

function isValidChromeRuntime() {
    return chrome.runtime && !!chrome.runtime.getManifest();
}

async function setControls() {
    const Cutcheckbox = document.getElementsByClassName('WikiHelperIsCutActive')[0];
    const toggleButton = document.getElementById('toggleButton');
    const versionsDiv = document.getElementById('versionsDiv');
    const preloader = document.getElementById("preloader");
    const content = document.getElementById("mainContent");
    const preloaderContainer = document.getElementById("preloaderContainer");
    const verticalTextBoxNewV = document.getElementById("verticalTextBoxNewV");
    const verticalTextBoxOldV = document.getElementById("verticalTextBoxOldV");
    const controlsToAdd = {};
    controlsToAdd.Cutcheckbox = Cutcheckbox;
    controlsToAdd.toggleButton = toggleButton;
    controlsToAdd.versionsDiv = versionsDiv;
    controlsToAdd.preloader = preloader;
    controlsToAdd.content = content;
    controlsToAdd.preloaderContainer = preloaderContainer;
    controlsToAdd.verticalTextBoxNewV = verticalTextBoxNewV;
    controlsToAdd.verticalTextBoxOldV = verticalTextBoxOldV;
    Object.keys(controlsToAdd).forEach(key => {
        if (!(key in controls)) {
            controls[key] = controlsToAdd[key];
        } else {
            console.warn(`Property ${key} already exists in controls.`);
        }
    });
}

function hidePreLoader() {
    if (controls.preloader) {
        controls.preloader.style.display = "none";
        controls.preloaderContainer.classList.add('collapsed');
    }
    if (controls.content) {
        controls.content.classList.remove("hidden");
    }
}

function verticalTextBoxesSettingsInit(){
    if (CurrentState.WikiHelperOldVText) controls.verticalTextBoxOldV.textContent = CurrentState.WikiHelperOldVText;
    controls.verticalTextBoxOldV.addEventListener('keypress', TextBoxOldVersionEventHandler);
}

function TextBoxNewVersionEventHandler() {
    let textContent = controls.verticalTextBoxOldV.textContent.trim();

    // Удаляем запятую в конце строки, если она есть
    if (textContent.endsWith(',')) {
        textContent = textContent.slice(0, -1);
    }

    try {
        const jsonString = `{${textContent}}`;
        const parsedData = JSON.parse(jsonString);
        console.log(parsedData);
    } catch (error) {
        console.error("Ошибка при парсинге JSON:", error.message);
    }

    chrome.storage.local.set({ WikiHelperOldVSettings: this.checked })
    if(this.checked) sendMsg({ WikiHelperIsCutActive: true });
    else sendMsg({ WikiHelperIsCutActive: false });
}

function TextBoxOldVersionEventHandler() {
    let textContent = controls.verticalTextBoxOldV.textContent.trim();

    if (textContent.endsWith(',')) {
        textContent = textContent.slice(0, -1);
    }
    
    let parsedData = '';
    try {
        const jsonString = `{${textContent}}`;
        parsedData = JSON.parse(jsonString);
        console.log(parsedData);
    } catch (error) {
        console.error("Ошибка при парсинге JSON:", error.message);
    }

    chrome.storage.local.set({ WikiHelperOldVSettings: parsedData, WikiHelperOldVText: textContent })
    sendMsg({ WikiHelperOldVSettings: parsedData });
}

