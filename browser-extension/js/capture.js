const browser = chrome

function injectScript(scriptName) {
    var s = document.createElement('script')
    s.src = chrome.runtime.getURL(scriptName)
    s.onload = function() {
        this.remove()
    }
    (document.head || document.documentElement).appendChild(s)
}

function ensureFullURL(_url) {
    let url = _url
    if (url[url.length - 1] === '&') {
        url = url.slice(0,-1)
    }
    if (url.startsWith('/')) {
        return `${window.location.protocol}//${window.location.hostname}${url}`
    } else {
        return url
    }
}

function downloadString(text, fileType, fileName) {
    var blob = new Blob([text], { type: fileType });
  
    var a = document.createElement('a');
    a.download = fileName;
    a.href = URL.createObjectURL(blob);
    a.dataset.downloadurl = [fileType, a.download, a.href].join(':');
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function() { URL.revokeObjectURL(a.href); }, 1500);
}

function init(origin, onInitCapture, onInitDefault) {
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
        
        if (message.type === 'init') {
            console.log('Wander Garden capture initialised. capture:', message.start_capture)
            if (message.start_capture) {
                if (document.readyState === "complete" || document.readyState === "loaded") {
                    showLoadingIndicator()
                } else {
                    window.addEventListener("DOMContentLoaded", function() {
                        showLoadingIndicator()
                    })
                }
                onInitCapture(sendCaptureStay, sendCaptureFinished)
            } else {
                onInitDefault()
            }
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