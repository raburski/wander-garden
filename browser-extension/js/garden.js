const browser = chrome

function onRuntimeFailed() {
    window.postMessage({ source: ORIGIN.GARDEN, type: 'init_failed' })
}

window.addEventListener('message', function(event) {
    if (event.data.source === ORIGIN.GARDEN) {
        browser.runtime.sendMessage(event.data).catch(onRuntimeFailed)
    }
})

browser.runtime.onMessage.addListener(function(message) {
    if (message.source !== ORIGIN.EXTENSION && message.target !== ORIGIN.GARDEN) {
        return
    }
    window.postMessage(message)
})

try {
    browser.runtime.sendMessage({
        source: ORIGIN.GARDEN,
        target: ORIGIN.EXTENSION, 
        type: 'init',
    }).catch(onRuntimeFailed)
} catch (e) {
    onRuntimeFailed(e)
}
