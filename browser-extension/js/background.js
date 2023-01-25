const ORIGIN = globalThis.ORIGIN

const browser = chrome
const STORE = {
    captureTabID: {}
}

function sendMessage(message) {
    const tabID = STORE.captureTabID[message.target]
    if (tabID) {
        console.log('SEND', message)
        browser.tabs.sendMessage(tabID, message)
    } else {
        console.log('Tab not found for', message.target)
    }

}

function startCapture(message) {
    switch (message.subject) {
        case ORIGIN.BOOKING:
            const url = 'https://secure.booking.com/myreservations.en-gb.html'
            browser.tabs.create({ url }, function(newTab) {
                STORE.captureTabID[message.subject] = newTab.id
            })
            break
    }
}

function handleWanderGardenMessage(message, sender) {
    switch (message.type) {
        case 'init':
            STORE.captureTabID[ORIGIN.GARDEN] = sender.tab.id
            sendMessage({
                source: ORIGIN.EXTENSION,
                target: ORIGIN.GARDEN, 
                type: 'init',
                version: '1.0',
            })
        case 'start_capture':
            startCapture(message)
            break
    }
}

function handleBookingComMessage(message) {
    switch (message.type) {
        case 'init':
            sendMessage({
                source: ORIGIN.EXTENSION,
                target: ORIGIN.BOOKING, 
                type: 'init',
                start_capture: !!STORE.captureTabID[ORIGIN.BOOKING]
            })
            break
        case 'capture_finished':
            browser.tabs.remove(STORE.captureTabID[ORIGIN.BOOKING])
            browser.tabs.update(STORE.captureTabID[ORIGIN.GARDEN], { active: true })
            STORE.captureTabID[ORIGIN.BOOKING] = undefined
            sendMessage({
                source: ORIGIN.EXTENSION,
                target: ORIGIN.GARDEN,
                subject: ORIGIN.BOOKING,
                type: 'capture_finished',
                stays: message.stays,
            })
    }
}

function onMessage(message, sender) {
    console.log('RECEIVED:', message)
    if (message.data) {
        console.log(JSON.parse(message.data))
    }
    switch (message.source) {
        case ORIGIN.GARDEN:
            handleWanderGardenMessage(message, sender)
            break
        case ORIGIN.BOOKING:
            handleBookingComMessage(message, sender)
            break
    }
}

browser.runtime.onInstalled.addListener(() => {
    console.log('onInstalled...');
    browser.runtime.onMessage.addListener(onMessage)
})
