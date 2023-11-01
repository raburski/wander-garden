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
    captureTabIDs: {},
    capturedStays: {},
    lastCapturedStayID: {},
    currentStayPartial: {},
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
    [ORIGIN.TRAVALA]: 'https://www.travala.com/my-bookings'
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
            STORE.capturedStays[message.subject] = []
            STORE.lastCapturedStayID[message.subject] = message.lastCapturedStayID
            chrome.tabs.create({ url }, function(newTab) {
                STORE.captureTabIDs[message.subject] = [newTab.id]
            })
            break
    }
}

function staysWithNoDuplicates(stays) {
    return stays.filter((stay, index) => {
        return stays.findIndex(s => s.id === stay.id) === index
    })
}

function captureFinished(source, messageStays) {
    STORE.captureTabIDs[source].forEach(tabId => chrome.tabs.remove(tabId))
    chrome.tabs.update(STORE.captureTabIDs[ORIGIN.GARDEN][0], { active: true })
    STORE.captureTabIDs[source] = undefined
    const stays = messageStays || STORE.capturedStays[source]
    const finalStays = staysWithNoDuplicates(stays)
    sendMessage({
        source: ORIGIN.SERVICE,
        target: ORIGIN.GARDEN,
        subject: source,
        type: 'capture_finished',
        stays: finalStays,
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
                lastCapturedStayID: STORE.lastCapturedStayID[message.source],
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
        case 'capture_stay':
            const stay = message.stay || STORE.currentStayPartial
            STORE.currentStayPartial = {}

            // TODO: Test this
            // if (lastCapturedStayID && lastCapturedStayID === stay.id) {
            //     captureFinished(message.source)
            //     break
            // }
            STORE.capturedStays[message.source].push(stay)
            if (STORE.captureTabIDs[message.source]?.includes(sender.tab.id)) {
                STORE.captureTabIDs[message.source] = STORE.captureTabIDs[message.source].filter(tabId => tabId !== sender.tab.id)
                chrome.tabs.remove(sender.tab.id)
            }
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
            captureFinished(message.source, message.stays)
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
