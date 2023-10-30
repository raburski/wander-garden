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

function parseHTMLSpecialSymbols(safe) {
    return safe
         .replace(/&amp;/g, "&")
         .replace(/&lt;/g, "<")
         .replace(/&gt;/g, ">")
         .replace(/&quot;/g, "\"")
         .replace(/&#039;/g, "'")
         .replace(/&nbsp;/g, " ")
         .replace(/ /g, ' ')
}

function getPriceCurrency(string) {
    const threeSymbolCurrencyRegex = /(^| )([A-Za-z]{3})( |$)/gi
    const threeSymbolMatch = string.match(threeSymbolCurrencyRegex)
    if (threeSymbolMatch) {
        const threeSymbol = threeSymbolMatch[0]
        return threeSymbol.trim().toUpperCase()
    }

    const oneLetterSymbols = Object.keys(currencyMap)
    const symbolMatch = oneLetterSymbols.map(symbol => string.includes(symbol) ? symbol : undefined).filter(Boolean)
    if (symbolMatch.length === 1) {
        return convertCurrencySymbol(symbolMatch[0])
    }

    return undefined
}

function priceFromString(string) {
    const amountRegex = /([0-9][0-9,\. ]*[0-9])/gi
    const amountMatch = string.match(amountRegex)
    if (!amountMatch) return undefined
    const amountString = amountMatch[0]
    if (!amountString) return undefined

    const remainingString = string.replace(amountString, '').trim()
    const currency = getPriceCurrency(remainingString)
    if (!currency) return undefined

    const cleanAmountString = amountString.trim().replace(/ /g, '')
    const numericRegex = /^([\d,]+)([\.,]\d{2})?$/gi
    const numericMatch = numericRegex.exec(cleanAmountString)
    if (numericMatch) {
        const integer = parseInt(numericMatch[1].replace(/,/g, ''))
        if (numericMatch[2]) {
            const real = parseInt(numericMatch[2].replace(/[\.,]/g, ''))
            const amount = integer + real / 100
            return { amount, currency }
        } else {
            return { amount: integer, currency }
        }
    }
    
    return undefined
}

const WAIT_STEP = 200
function waitForElement(selector, timeout = 10000) {
    let lapsed = 0

    return new Promise((resolve, reject) => {
        const timer = setInterval(() => {
            const elements = document.querySelectorAll(selector)
            if (elements.length > 0) {
                resolve()
            } else if (lapsed > timeout) {
                clearInterval(timer)
                reject()
            }
        })
    })
}

function sleep(time) {
    return new Promise((resolve) => {
        setTimeout(resolve, time)
    })
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

    function sendSkipCapture() {
        browser.runtime.sendMessage({ source: origin, target: ORIGIN.SERVICE, type: 'skip_capture' })
    }

    function sendOpenWindow(url) {
        browser.runtime.sendMessage({ source: origin, target: ORIGIN.SERVICE, type: 'open_window', url })
    }

    function sendCaptureStayPartial(stay) {
        browser.runtime.sendMessage({ source: origin, target: ORIGIN.SERVICE, type: 'capture_stay_partial', stay })
    }

    function sendError(error, location) {
        browser.runtime.sendMessage({ source: origin, target: ORIGIN.SERVICE, type: 'error', error: `${error}`, location })
        return undefined
    }

    let ON_NETWORK_CAPTURED = undefined
    function registerOnNetworkCaptured(callback) {
        ON_NETWORK_CAPTURED = callback
    }

    let ON_STAY_CAPTURED = undefined
    function registerOnStayCaptured(callback) {
        ON_STAY_CAPTURED = callback
    }

    function onExtensionMessage(message) {
        console.log('onExtensionMessage', message)
        if ((message.type === 'stay_captured' || message.type === 'skip_capture') && ON_STAY_CAPTURED) {
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
                    openWindow: sendOpenWindow,
                    skipCapture: sendSkipCapture,
                    captureStay: sendCaptureStay,
                    captureStayPartial: sendCaptureStayPartial,
                    captureFinished: sendCaptureFinished,
                    onStayCaptured: registerOnStayCaptured,
                    onNetworkCaptured: registerOnNetworkCaptured,
                    sendError: sendError,
                    lastCapturedStayID: message.lastCapturedStayID
                })
            } else {
                if (onInitDefault) {
                    onInitDefault()
                }
            }
        }
    }
    
    browser.runtime.onMessage.addListener(onExtensionMessage)

    let WINDOW_INITD = false
    let STORED_NETWORKING = []
    function storeOrSendNetworkCaptured(_url, _body) {
        if (!WINDOW_INITD) {
            STORED_NETWORKING.push({ url: _url, body: _body })
        } else {
            STORED_NETWORKING.forEach(({ url, body }) => ON_NETWORK_CAPTURED(url, body))
            if (_url && _body) {
                ON_NETWORK_CAPTURED(_url, _body)
            }
        }

    }
    function onWindowMessage(message) {
        if (message.data && message.data.type === "response_captured" && ON_NETWORK_CAPTURED) {
            ON_NETWORK_CAPTURED(message.data.url, message.data.body)
        }
    }
    window.addEventListener("message", onWindowMessage)
    
    onWindowLoad(function() {
        WINDOW_INITD = true
        storeOrSendNetworkCaptured()

        browser.runtime.sendMessage({
            source: origin,
            target: ORIGIN.SERVICE, 
            type: 'init',
        })
    })
}

class Page {
    init(isCapturing = false, core = {}) {
        this.core = core
        this.isCapturing = isCapturing
        if (this.core.onStayCaptured && this.onStayCaptured) {
            this.core.onStayCaptured(this.onStayCaptured.bind(this))
        }
        if (this.core.onNetworkCaptured && this.onNetworkCaptured) {
            this.core.onNetworkCaptured(this.onNetworkCaptured.bind(this))
        }
    }
}

function getCurrentPageClass(pages) {
    return pages.find(page => {
        const paths = Array.isArray(page.path) ? page.path : [page.path]
        const url = window.location.href
        return paths.map(path => url.toUpperCase().includes(path.toUpperCase())).reduce((v, acc) => v || acc, false)
    })
}

function initPages(origin, ...pages) {
    const PageClass = getCurrentPageClass(pages)
    if (!PageClass) return

    const page = new PageClass()
    async function onInitCapture(core) {
        await page.init(true, core)
        await page.run()
    }
    function onInitDefault() {
        // TODO: for now just ignoring this
        // only capturing is a legit form of getting stays
    }
    init(origin, onInitCapture, onInitDefault)
}

globalThis.init = init
globalThis.initPages = initPages