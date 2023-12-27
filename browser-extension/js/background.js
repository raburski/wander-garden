// DOUBLED IN COSTS.JS
const ORIGIN = {
    GARDEN: 'wander_garden',
    EXTENSION: 'wander_garden_extension',
    SERVICE: 'wander_garden_service',
    BOOKING: 'booking.com_extension',
    AIRBNB: 'airbnb_extension',
    AGODA: 'agoda_extension',
    TRAVALA: 'travala_extension',

    TRIP_ADVISOR: 'trip_advisor_extension',
    GET_YOUR_GUIDE: 'get_your_guide_extension',

    TRAVALA_FLIGHTS: 'travala_flights',
    MILES_AND_MORE: 'miles_and_more',
    RYANAIR: 'ryanair',
}

const STORE = {
    captureTabIDs: {},
    capturedObjects: {},
    lastCapturedObjectID: {},
    currentObjectPartial: {},
}

const manifest = chrome.runtime.getManifest()

function sendMessage(message, toTabID) {
    const tabID = toTabID || STORE.captureTabIDs[message.target][0]
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
    [ORIGIN.TRAVALA]: 'https://www.travala.com/my-bookings',
    [ORIGIN.GET_YOUR_GUIDE]: 'https://www.getyourguide.com/customer-bookings/',
    [ORIGIN.TRIP_ADVISOR]: 'https://www.tripadvisor.com/Bookings',
    [ORIGIN.TRAVALA_FLIGHTS]: 'https://www.travala.com/flights/my-bookings',
    [ORIGIN.MILES_AND_MORE]: 'https://www.miles-and-more.com/row/en/account/my-bookings.html'
}

function handleGardenMessage(message, sender) {
    switch (message.type) {
        case 'init':
            STORE.captureTabIDs[ORIGIN.GARDEN] = [sender.tab.id]
            sendMessage({
                source: ORIGIN.SERVICE,
                target: ORIGIN.GARDEN, 
                type: 'init',
                version: manifest.version,
            })
            break
        case 'start_capture':
            STORE.captureTabIDs[ORIGIN.GARDEN] = [sender.tab.id]
            const url = ORIGIN_URL[message.subject]
            STORE.capturedObjects[message.subject] = []
            STORE.lastCapturedObjectID[message.subject] = message.lastCapturedObjectID
            chrome.tabs.create({ url }, function(newTab) {
                STORE.captureTabIDs[message.subject] = [newTab.id]
            })
            break
    }
}

function objectsWithNoDuplicates(objects) {
    return objects.filter((object, index) => {
        return objects.findIndex(s => s.id === object.id) === index
    })
}

function captureFinished(source, messageObjects) {
    STORE.captureTabIDs[source].forEach(tabId => chrome.tabs.remove(tabId))
    chrome.tabs.update(STORE.captureTabIDs[ORIGIN.GARDEN][0], { active: true })
    STORE.captureTabIDs[source] = undefined
    const objects = messageObjects || STORE.capturedObjects[source]
    const finalObjects = objectsWithNoDuplicates(objects)
    sendMessage({
        source: ORIGIN.SERVICE,
        target: ORIGIN.GARDEN,
        subject: source,
        type: 'capture_finished',
        objects: finalObjects,
    })
}

function handleExtensionMessage(message, sender) {
    switch (message.type) {
        case 'init':
            sendMessage({
                source: ORIGIN.SERVICE,
                target: message.source, 
                type: 'init',
                start_capture: STORE.captureTabIDs[message.source]?.includes(sender.tab.id),
                lastCapturedObjectID: STORE.lastCapturedObjectID[message.source],
            }, sender.tab.id)
            break
        case 'skip_capture':
            if (STORE.captureTabIDs[message.source]?.includes(sender.tab.id)) {
                STORE.captureTabIDs[message.source] = STORE.captureTabIDs[message.source].filter(tabId => tabId !== sender.tab.id)
                chrome.tabs.remove(sender.tab.id)
            }
            sendMessage({
                source: ORIGIN.SERVICE,
                target: message.source,
                subject: message.source,
                type: 'skip_capture',
            })
            break
        case 'open_window':
            chrome.tabs.create({ url: message.url }, function(newTab) {
                STORE.captureTabIDs[message.source].push(newTab.id)
            })
            break
        case 'capture_object':
            const object = message.object || STORE.currentObjectPartial
            STORE.currentObjectPartial = {}

            const lastCapturedObjectID = STORE.lastCapturedObjectID[message.source]
            if (lastCapturedObjectID && object && lastCapturedObjectID === object.id) {
                captureFinished(message.source)
                break
            }
            STORE.capturedObjects[message.source].push(object)
            if (STORE.captureTabIDs[message.source]?.includes(sender.tab.id)) {
                STORE.captureTabIDs[message.source] = STORE.captureTabIDs[message.source].filter(tabId => tabId !== sender.tab.id)
                chrome.tabs.remove(sender.tab.id)
            }
            sendMessage({
                source: ORIGIN.SERVICE,
                target: message.source,
                subject: message.source,
                type: 'object_captured',
                object,
            })
            break
        case 'capture_object_partial':
            STORE.currentObjectPartial = deepMerge(STORE.currentObjectPartial, message.object)
            break
        case 'capture_finished':
            captureFinished(message.source, message.objects)
            break
        case 'error':
            STORE.captureTabIDs[message.source].forEach(tabId => chrome.tabs.remove(tabId))
            chrome.tabs.update(STORE.captureTabIDs[ORIGIN.GARDEN][0], { active: true })
            STORE.captureTabIDs[message.source] = undefined
            sendMessage({
                source: ORIGIN.SERVICE,
                target: ORIGIN.GARDEN,
                subject: message.source,
                type: 'error',
                error: message.error,
                location: message.location,
                stack: message.stack,
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
