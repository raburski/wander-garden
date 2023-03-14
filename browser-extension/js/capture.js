const browser = chrome

function injectScript(scriptName) {
    var s = document.createElement('script')
    s.src = chrome.runtime.getURL(scriptName)
    s.onload = function() {
        this.remove()
    }
    (document.head || document.documentElement).appendChild(s)
}

function ensureFullURL(url) {
    if (url.startsWith('/')) {
        return `${window.location.protocol}//${window.location.hostname}${url}`
    } else {
        return url
    }
}

function init(origin, onInit) {
    window.addEventListener("DOMContentLoaded", function() {
        showLoadingIndicator()
    })

    function sendCaptureFinished(stays) {
        browser.runtime.sendMessage({ source: origin, target: ORIGIN.SERVICE, type: 'capture_finished', stays })
    }

    function sendCaptureStay(stay) {
        browser.runtime.sendMessage({ source: origin, target: ORIGIN.SERVICE, type: 'capture_stay', stay })
    }

    function onExtensionMessage(message) {
        if (message.target !== origin || message.source !== ORIGIN.SERVICE) {
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
        target: ORIGIN.SERVICE, 
        type: 'init',
    })
}

globalThis.init = init