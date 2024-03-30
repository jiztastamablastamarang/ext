console.log("Loading content.js");

injectPatchScript();

function injectPatchScript() {
    const scriptElement = document.createElement("script");
    scriptElement.src = chrome.runtime.getURL("patch.js");
    scriptElement.onload = function () {
        this.remove()
    };
    (document.head || document.documentElement).appendChild(scriptElement);
}

document.addEventListener("ResponseRedirected", event => {
    chrome.runtime.sendMessage(event.detail)
        .then(onResponse)
        .catch(onError);
});

function onResponse(resp) {
    console.log(`Response from background: ${resp}`);
}

function onError(err) {
    console.log(`Error sending to background: ${err}`);
}