const browser = chrome

window.addEventListener('message', function(event) {
    if (event.data.source === ORIGIN.GARDEN) {
        browser.runtime.sendMessage(event.data)
    }
})

function onExtensionMessage(message) {
    if (message.source !== ORIGIN.EXTENSION && message.target !== ORIGIN.GARDEN) {
        return
    }
    window.postMessage(message)
}

browser.runtime.onMessage.addListener(onExtensionMessage)

try {
    browser.runtime.sendMessage({
        source: ORIGIN.GARDEN,
        target: ORIGIN.EXTENSION, 
        type: 'init',
    })
} catch (e) {
    window.postMessage({ source: ORIGIN.GARDEN, type: 'init_failed' })
}
