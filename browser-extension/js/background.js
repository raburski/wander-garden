const ORIGIN = {
    GARDEN: 'wander_garden',
    EXTENSION: 'wander_garden_extension',
    SERVICE: 'wander_garden_service',
    BOOKING: 'booking.com_extension',
    AIRBNB: 'airbnb_extension',
    AGODA: 'agoda_extension'
}

const STORE = {
    captureTabID: {},
    capturedStays: {},
}

const manifest = chrome.runtime.getManifest()

function sendMessage(message, toTabID) {
    const tabID = STORE.captureTabID[message.target] || toTabID
    if (tabID) {
        console.log('SEND', message)
        chrome.tabs.sendMessage(tabID, message)
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
            chrome.tabs.create({ url }, function(newTab) {
                STORE.captureTabID[message.subject] = newTab.id
            })
            break
    }
}

function handleExtensionMessage(message, sender) {
    switch (message.type) {
        case 'init':
            sendMessage({
                source: ORIGIN.SERVICE,
                target: message.source, 
                type: 'init',
                start_capture: !!STORE.captureTabID[message.source]
            }, sender.tab.id)
            break
        case 'capture_stay':
            STORE.capturedStays[message.source].push(message.stay)
            break
        case 'capture_finished':
            chrome.tabs.remove(STORE.captureTabID[message.source])
            chrome.tabs.update(STORE.captureTabID[ORIGIN.GARDEN], { active: true })
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

chrome.runtime.onMessage.addListener(onMessage)
