const ORIGIN = {
    GARDEN: 'wander_garden',
    EXTENSION: 'wander_garden_extension',
    SERVICE: 'wander_garden_service',
    BOOKING: 'booking.com_extension',
    AIRBNB: 'airbnb_extension',
    AGODA: 'agoda_extension'
}

const browser = chrome
const STORE = {
    captureTabID: {},
    capturedStays: {},
}

const manifest = chrome.runtime.getManifest()

function sendMessage(message) {
    const tabID = STORE.captureTabID[message.target]
    if (tabID) {
        console.log('SEND', message)
        browser.tabs.sendMessage(tabID, message)
    } else {
        console.log('Tab not found for', message.target)
    }
}

const ORIGIN_URL = {
    [ORIGIN.BOOKING]: 'https://secure.booking.com/myreservations.en-gb.html',
    [ORIGIN.AIRBNB]: 'https://www.airbnb.com/trips/v1',
    [ORIGIN.AGODA]: 'https://www.agoda.com/en-gb/account/bookings.html?sort=CheckinDate&state=Past&page=1',
}

function handleGardenMessage(message, sender) {
    switch (message.type) {
        case 'init':
            STORE.captureTabID[ORIGIN.GARDEN] = sender.tab.id
            sendMessage({
                source: ORIGIN.SERVICE,
                target: ORIGIN.GARDEN, 
                type: 'init',
                version: manifest.version,
            })
            break
        case 'start_capture':
            STORE.captureTabID[ORIGIN.GARDEN] = sender.tab.id
            const url = ORIGIN_URL[message.subject]
            STORE.capturedStays[message.subject] = []
            browser.tabs.create({ url }, function(newTab) {
                STORE.captureTabID[message.subject] = newTab.id
            })
            break
    }
}

function handleExtensionMessage(message) {
    switch (message.type) {
        case 'init':
            sendMessage({
                source: ORIGIN.SERVICE,
                target: message.source, 
                type: 'init',
                start_capture: !!STORE.captureTabID[message.source]
            })
            break
        case 'capture_stay':
            STORE.capturedStays[message.source].push(message.stay)
            break
        case 'capture_finished':
            browser.tabs.remove(STORE.captureTabID[message.source])
            browser.tabs.update(STORE.captureTabID[ORIGIN.GARDEN], { active: true })
            STORE.captureTabID[message.source] = undefined
            const stays = !message.stays ? STORE.capturedStays[message.source] : message.stays
            sendMessage({
                source: ORIGIN.SERVICE,
                target: ORIGIN.GARDEN,
                subject: message.source,
                type: 'capture_finished',
                stays,
            })
            break
    }
}

function onMessage(message, sender) {
    console.log('RECV: ', message)
    if (message.source === ORIGIN.EXTENSION || message.source === ORIGIN.GARDEN) {
        handleGardenMessage(message, sender)
    } else {
        handleExtensionMessage(message, sender)
    }
}

browser.runtime.onMessage.addListener(onMessage)
