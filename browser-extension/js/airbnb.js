const ORIGIN = globalThis.ORIGIN
const countryCodeToName = globalThis.countryCodeToName
const browser = chrome

function ensureFullURL(url) {
    if (url.startsWith('/')) {
        return `${window.location.protocol}//${window.location.hostname}${url}`
    } else {
        return url
    }
}

function startCapture() {
    showLoadingIndicator()
    const hash = !!window.location.hash ? window.location.hash : '#root&0'
    const parts = `${hash}`.substring(1).split('&')
    const page = parts[0]
    if (page === 'root') {
        // on the trips page
        const index = parseInt(parts[1])
        const allCards = [...document.querySelectorAll("div[data-section-id='PAST_TRIPS'] div[data-testid='reservation-card'] > a")]
        if (index > allCards.length - 1) {
            onCaptureFinished()
        } else {
            const urlBase = window.location.href.split('#')[0]
            const nextURL = `${urlBase}#root&${index+1}`
            const currentURL = `${allCards[index].getAttribute('href')}#detail&${btoa(nextURL)}`
            setTimeout(() => window.location = currentURL, 200)
        }
    } else if (page === 'detail') {
        // on the trip detail page
        const nextURL = atob(parts[1])
        const idRegex = /\/trips\/v[0-9]\/([^\/]+)\//g
        const cityRegex = /( in )(.(?<! in ))+$/g
        
        try {
            const accomodationElement = document.querySelector("a[data-testid='reservation-destination-link']")
            const accomodationURL = accomodationElement.getAttribute('href')
            const nameElement = accomodationElement.querySelectorAll("a[data-testid='reservation-destination-link'] span")[2]
            const accomodationName = nameElement.innerHTML

            const id = idRegex.exec(window.location.href)[1]
            const dataState = JSON.parse(document.getElementById('data-state').innerHTML)
            const reservations = dataState.bootstrapData.reduxData.reservations
            const reservationKeys = Object.keys(reservations)
            const metadata = reservations[reservationKeys[0]].metadata
            const city = cityRegex.exec(metadata.title)[0].substring(4)
            const cc = metadata.country
            const stay = {
                id,
                since: `${metadata.check_in_date}T00:00:00+00:00`,
                until: `${metadata.check_out_date}T00:00:00+00:00`,
                location: {
                    address: '',
                    city,
                    state: '',
                    country: countryCodeToName[cc.toUpperCase()],
                    cc: cc.toLowerCase(),
                    postalCode: '',
                    lat: metadata.lat,
                    lng: metadata.lng,
                },
                accomodation: {
                    name: accomodationName,
                    url: ensureFullURL(accomodationURL),
                }
            }
            browser.runtime.sendMessage({ source: ORIGIN.AIRBNB, target: ORIGIN.EXTENSION, type: 'capture_stay', stay })
            setTimeout(() => window.location = nextURL, 200)
        } catch (e) {
            console.log('airbnb capture failed', e)
            alert('Airbnb capture failed :(')
        }
    }
}

function onExtensionMessage(message) {
    if (message.source !== ORIGIN.EXTENSION) {
        return
    }
    
    if (message.type === 'init' && message.start_capture) {
        setTimeout(startCapture, 300)
    }
}

function onCaptureFinished() {
    browser.runtime.sendMessage({ source: ORIGIN.AIRBNB, target: ORIGIN.EXTENSION, type: 'capture_finished' })
}

browser.runtime.onMessage.addListener(onExtensionMessage)

browser.runtime.sendMessage({
    source: ORIGIN.AIRBNB,
    target: ORIGIN.EXTENSION, 
    type: 'init',
})
