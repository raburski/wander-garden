const browser = chrome

function deepMerge(target, source) {
  Object.keys(source).forEach(key => {
    if (source[key] instanceof Object && key in target) {
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  });
  return target;
}

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

function onWindowLoad(callback) {
    if (document.readyState === "complete" || document.readyState === "interactive") {
        callback()
    } else {
        window.addEventListener("load", callback)
    }
}

function init(origin, onInitCapture, onInitDefault) {
    console.log('on core init')
    function sendCaptureFinished(stays) {
        browser.runtime.sendMessage({ source: origin, target: ORIGIN.SERVICE, type: 'capture_finished', stays })
    }

    function sendCaptureStay(stay) {
        browser.runtime.sendMessage({ source: origin, target: ORIGIN.SERVICE, type: 'capture_stay', stay })
    }

    function sendCaptureStayPartial(stay) {
        browser.runtime.sendMessage({ source: origin, target: ORIGIN.SERVICE, type: 'capture_stay_partial', stay })
    }

    let ON_STAY_CAPTURED = undefined
    function registerOnStayCaptured(callback) {
        ON_STAY_CAPTURED = callback
    }

    function onExtensionMessage(message) {
        console.log('onExtensionMessage', message)
        if (message.type === 'stay_captured' && ON_STAY_CAPTURED) {
            return ON_STAY_CAPTURED(message)
        }

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

                onInitCapture({
                    captureStay: sendCaptureStay,
                    captureStayPartial: sendCaptureStayPartial,
                    captureFinished: sendCaptureFinished,
                    onStayCaptured: registerOnStayCaptured,
                    lastCapturedStayID: message.lastCapturedStayID
                })
            } else {
                onInitDefault()
            }
        }
    }
    
    browser.runtime.onMessage.addListener(onExtensionMessage)
    
    onWindowLoad(function() {
        browser.runtime.sendMessage({
            source: origin,
            target: ORIGIN.SERVICE, 
            type: 'init',
        })
    })
}

globalThis.init = init