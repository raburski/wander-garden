const browser = chrome

function ensureFullURL(url) {
    if (url.startsWith('/')) {
        return `${window.location.protocol}//${window.location.hostname}${url}`
    } else {
        return url
    }
}

function init(origin, onInit) {

    function sendCaptureFinished(stays) {
        browser.runtime.sendMessage({ source: origin, target: ORIGIN.EXTENSION, type: 'capture_finished', stays })
    }

    function sendCaptureStay(stay) {
        browser.runtime.sendMessage({ source: origin, target: ORIGIN.EXTENSION, type: 'capture_stay', stay })
    }

    function onExtensionMessage(message) {
        if (message.target !== origin || message.source !== ORIGIN.EXTENSION) {
            return
        }
        
        if (message.type === 'init' && message.start_capture) {
            console.log('Wander Garden capture initialised.')
            onInit(sendCaptureStay, sendCaptureFinished)
        }
    }
    
    browser.runtime.onMessage.addListener(onExtensionMessage)
    
    browser.runtime.sendMessage({
        source: origin,
        target: ORIGIN.EXTENSION, 
        type: 'init',
    })
}

globalThis.init = init