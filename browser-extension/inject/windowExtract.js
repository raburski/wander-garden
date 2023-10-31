function sendData() {
    window.postMessage({
        target: 'agoda_extension',
        type: 'data_extracted',
        data: window.editBookingPageParams,
    }, '*')
}

function isLoaded() {
    return document.readyState === "complete" || document.readyState === "interactive"
}

if (isLoaded()) {
    sendData()
} else {
    window.addEventListener("load", function() {
        sendData()
    })
}

