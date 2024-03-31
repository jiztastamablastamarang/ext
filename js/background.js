console.log("Loading background.js");

/*
Import everything from WASM:
import * as wasm from "./ext.js";
*/

import initWasm, {hello, log, process_response} from "./ext.js";

(async () => {
    await initWasm();
    hello();
})();

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {
        process_response(message);
        sendResponse({message: "Message from background received"});
        return true;
    }
);

let patchScriptLoaded = false;
let requestsToDelay = [];

// Intercept requests
chrome.webRequest.onBeforeRequest.addListener(
    details => {
        if (!patchScriptLoaded) {
            requestsToDelay.push(details);
            return { cancel: true };
        }
    },
    { urls: ["*://www.linkedin.com/*"] },
    ["blocking"]
);

function processDelayedRequests() {
    requestsToDelay.forEach(details => {
        if (details.method === "GET") {
            fetch(details.url)
                .then(onResponse)
                .catch(onError);
        }
    });

    requestsToDelay = [];
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "loading" && tab.url) {
        chrome.scripting.executeScript({
            target: {tabId: tabId},
            files: ["patch.js"],
            world: "MAIN"
        }).then(() => {
            patchScriptLoaded = true;
            processDelayedRequests();
            console.log("Injection script executed on updated tab.");
        }).catch(err => console.error("Injection failed: ", err));
    }
});

