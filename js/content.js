console.log("Loading content.js");

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
