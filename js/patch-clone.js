console.log("Loading patch.js");

catchAndRedirectResponse();

function catchAndRedirectResponse() {
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
        let chunks = [];

        this.onprogress = function (event) {
            if (event.target.responseType === "arraybuffer" && event.target.response) {
                chunks.push(new Uint8Array(event.target.response));
            }
        };

        this.onload = function () {
            if (this.responseType === "arraybuffer") {
                const combined = concatenateUint8Arrays(chunks);
                const data = arrayBufferToBase64(combined.buffer);
                sendResponse(url, data, this.responseType);
            } else {
                processResponse(this).then(data => {
                    if (data !== undefined) {
                        sendResponse(url, data, this.responseType);
                    }
                });
            }
        };

        return originalOpen.apply(this, arguments);
    };
}

async function processResponse(xhr) {
    switch (xhr.responseType) {
        case "":
        case "text":
            return xhr.responseText;
        case "blob":
            return await blobToBase64(xhr.response);
        case "document":
            return xhr.responseXML ? new XMLSerializer().serializeToString(xhr.responseXML) : "";
        case "json":
            return JSON.stringify(xhr.response);
        default:
            console.error("Unsupported response type");
            return undefined;
    }
}

function concatenateUint8Arrays(arrays) {
    let totalLength = arrays.reduce((acc, value) => acc + value.length, 0);
    let result = new Uint8Array(totalLength);
    let offset = 0;
    arrays.forEach(array => {
        result.set(array, offset);
        offset += array.length;
    });
    return result;
}

function arrayBufferToBase64(buffer) {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            const base64 = dataUrl.split(",")[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

function sendResponse(url, data, responseType) {
    document.dispatchEvent(new CustomEvent("ResponseRedirected", {detail: {url, data, responseType}}));
}
