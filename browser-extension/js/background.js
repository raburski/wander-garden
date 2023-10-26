const ORIGIN = {
    GARDEN: 'wander_garden',
    EXTENSION: 'wander_garden_extension',
    SERVICE: 'wander_garden_service',
    BOOKING: 'booking.com_extension',
    AIRBNB: 'airbnb_extension',
    AGODA: 'agoda_extension',
    TRAVALA: 'travala_extension',
}

const STORE = {
    captureTabID: {},
    capturedStays: {},
    lastCapturedStayID: {},
    currentStayPartial: {},
}

const manifest = chrome.runtime.getManifest()

function sendMessage(message, toTabID) {
    const tabID = toTabID || STORE.captureTabID[message.target]
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
    [ORIGIN.TRAVALA]: 'https://www.travala.com/my-bookings'
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
            STORE.lastCapturedStayID[message.subject] = message.lastCapturedStayID
            chrome.tabs.create({ url }, function(newTab) {
                STORE.captureTabID[message.subject] = newTab.id
            })
            break
    }
}

function staysWithNoDuplicates(stays) {
    return stays.filter((stay, index) => {
        return stays.findIndex(s => s.id === stay.id) === index
    })
}

function handleExtensionMessage(message, sender) {
    switch (message.type) {
        case 'init':
            sendMessage({
                source: ORIGIN.SERVICE,
                target: message.source, 
                type: 'init',
                start_capture: !!STORE.captureTabID[message.source],
                lastCapturedStayID: STORE.lastCapturedStayID[message.source],
            }, sender.tab.id)
            break
        case 'skip_capture':
            sendMessage({
                source: ORIGIN.SERVICE,
                target: message.source,
                subject: message.source,
                type: 'skip_capture',
            })
            break
        case 'capture_stay':
            const stay = message.stay || STORE.currentStayPartial
            STORE.capturedStays[message.source].push(stay)
            STORE.currentStayPartial = {}
            sendMessage({
                source: ORIGIN.SERVICE,
                target: message.source,
                subject: message.source,
                type: 'stay_captured',
                stay,
            })
            break
        case 'capture_stay_partial':
            STORE.currentStayPartial = deepMerge(STORE.currentStayPartial, message.stay)
            break
        case 'capture_finished':
            chrome.tabs.remove(STORE.captureTabID[message.source])
            chrome.tabs.update(STORE.captureTabID[ORIGIN.GARDEN], { active: true })
            STORE.captureTabID[message.source] = undefined
            const stays = message.stays || STORE.capturedStays[message.source]
            const finalStays = staysWithNoDuplicates(stays)
            sendMessage({
                source: ORIGIN.SERVICE,
                target: ORIGIN.GARDEN,
                subject: message.source,
                type: 'capture_finished',
                stays: finalStays,
            })
            break
        case 'error':
            chrome.tabs.remove(STORE.captureTabID[message.source])
            chrome.tabs.update(STORE.captureTabID[ORIGIN.GARDEN], { active: true })
            STORE.captureTabID[message.source] = undefined
            sendMessage({
                source: ORIGIN.SERVICE,
                target: ORIGIN.GARDEN,
                subject: message.source,
                type: 'error',
                error: message.error,
                location: message.location,
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
