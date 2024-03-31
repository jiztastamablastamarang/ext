console.log("Loading patch.js");

function catchAndRedirectResponse() {
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
        let chunks = []; // For accumulating arraybuffer data

        this.onprogress = function (event) {
            // Note: This is here for completeness but typically won't provide partial arraybuffers.
            console.log("Data is loading:", event.loaded, "/", event.total);
        };

        this.onload = function () {
            switch (this.responseType) {
                case "arraybuffer":
                    // Directly handling the arraybuffer response once fully loaded.
                    handleArrayBufferResponse(this.response, url);
                    break;
                case "blob":
                    // Convert blob to text or base64 for serialization
                    blobToTextOrBase64(this.response, url);
                    break;
                case "":
                    handleTextResponse(this.response, url);
                    break;
                case "text":
                    // Handle text response including JSON as text
                    handleTextResponse(this.responseText, url);
                    break;
                case "json":
                    // Handle JSON response (note: responseType 'json' automatically parses the response)
                    handleJSONResponse(this.response, url);
                    break;
                case "document":
                    handleDocumentResponse(this.response, url);
                    break;
                default:
                    console.error("Unsupported responseType encountered:", this.responseType);
            }
        };

        return originalOpen.apply(this, arguments);
    };
}

function handleArrayBufferResponse(arrayBuffer, url) {
    const base64String = arrayBufferToBase64(arrayBuffer);
    sendResponse(url, base64String, "arraybuffer");
}

function blobToTextOrBase64(blob, url) {
    const reader = new FileReader();
    reader.onload = () => {
        // Attempt to parse as JSON, otherwise send as base64 encoded text
        try {
            const jsonData = JSON.parse(reader.result);
            sendResponse(url, JSON.stringify(jsonData), "json");
        } catch (e) {
            sendResponse(url, window.btoa(reader.result), "blob");
        }
    };
    reader.readAsText(blob);
}

function handleTextResponse(text, url) {
    // Assuming text could be JSON, attempt to parse and serialize
    try {
        const jsonData = JSON.parse(text);
        sendResponse(url, JSON.stringify(jsonData), "json");
    } catch (e) {
        // If not JSON, send as is
        sendResponse(url, text, "text");
    }
}

function handleJSONResponse(json, url) {
    sendResponse(url, JSON.stringify(json), "json");
}

function arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    for (var i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function handleDocumentResponse(document, url) {
    let serializedDocument;
    if (document instanceof XMLDocument) {
        // For XML documents
        const serializer = new XMLSerializer();
        serializedDocument = serializer.serializeToString(document);
    } else if (document instanceof HTMLDocument) {
        // For HTML documents
        serializedDocument = document.documentElement.outerHTML;
    }

    if (serializedDocument) {
        sendResponse(url, serializedDocument, "document");
    } else {
        console.error("Failed to serialize document.");
    }
}

function sendResponse(url, data, responseType) {
    document.dispatchEvent(new CustomEvent("ResponseRedirected", {detail: {url, data, responseType}}));
}

catchAndRedirectResponse();
