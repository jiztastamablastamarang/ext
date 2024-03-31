console.log("Loading popup.js");

document.addEventListener("DOMContentLoaded", setupButtonEventListener);

async function setupButtonEventListener() {
    let btn = document.getElementById("catch_btn");
    btn.addEventListener("click", async function () {
        console.log("Catching button click");
/*
        catchResponse()
            .then(onResponse)
            .catch(onError);
*/
    });
}

function onResponse(resp) {
    console.log(`Response: ${resp}`);
}

function onError(err) {
    console.log(`Error: ${err}`);
}