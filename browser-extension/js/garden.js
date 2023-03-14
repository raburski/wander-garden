const browser = chrome

function onRuntimeFailed(e) {
    console.log('onRuntimeFailed', e)
    window.postMessage({ source: ORIGIN.EXTENSION, type: 'init_failed' })
}

window.addEventListener('message', function(event) {
    if (event.data.source === ORIGIN.GARDEN) {
        browser.runtime.sendMessage(event.data).catch(onRuntimeFailed)
    }
})

browser.runtime.onMessage.addListener(function(message) {
    if (message.source === ORIGIN.SERVICE) {
        window.postMessage(message)
    }
})

try {
    browser.runtime.sendMessage({
        source: ORIGIN.EXTENSION,
        target: ORIGIN.SERVICE, 
        type: 'init',
    }).catch(onRuntimeFailed)
} catch (e) {
    onRuntimeFailed(e)
}
