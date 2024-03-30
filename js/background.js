console.log("Loading background.js");

/*
Import everything from WASM:
import * as wasm from "./ext.js";
*/

import initWasm, {hello, log, process_response} from "./ext.js";

(async () => {
    await initWasm();
    hello();
    process_response("Hello from background.js");
})();

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {
        console.log("Received message from popup");
        process_response(message.url);
        sendResponse({message: "Message from background received"});
        return true;
    }
);


