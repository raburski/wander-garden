function extractStayFromDocument() {
    const idRegex = /\/trips\/v[0-9]\/([^\/]+)\//g
    const cityRegex = /( in )(.(?<! in ))+$/g

    const accomodationElement = document.querySelector("a[data-testid='reservation-destination-link']")
    const accomodationURL = accomodationElement.getAttribute('href')
    const nameElement = accomodationElement.querySelectorAll("a[data-testid='reservation-destination-link'] span")[2]
    const accomodationName = nameElement.innerHTML

    const matchMoneyRe = /([\d\.]+) ([^\d ]+ )?([A-Za-z][A-Za-z][A-Za-z])$/g
    const priceElements = [...document.querySelectorAll("div[data-testid='reservation-title-subtitle'] p")]
        .map(e => matchMoneyRe.exec(e.innerHTML.replace('&nbsp;', ' ')))
        .filter(e => e)
    const price = priceElements.length === 1 ? { amount: parseFloat(priceElements[0][1]), currency: priceElements[0][3] } : undefined

    const id = idRegex.exec(window.location.href)[1]
    const dataState = JSON.parse(document.getElementById('data-state').innerHTML)
    const reservations = dataState.bootstrapData.reduxData.reservations
    const reservationKeys = Object.keys(reservations)
    const metadata = reservations[reservationKeys[0]].metadata
    const city = cityRegex.exec(metadata.title)[0].substring(4)
    const cc = metadata.country
    return {
        id: `airbnb:${id}`,
        url: window.location.href,
        since: `${metadata.check_in_date}T00:00:00+00:00`,
        until: `${metadata.check_out_date}T00:00:00+00:00`,
        location: {
            city,
            country: countryCodeToName[cc.toUpperCase()],
            cc: cc.toLowerCase(),
            lat: metadata.lat,
            lng: metadata.lng,
        },
        accomodation: {
            name: accomodationName,
            url: ensureFullURL(accomodationURL),
        },
        price,
    }
}

function initCapture(captureStay, captureFinished) {
    if (window.location.href.includes('login')) {
        // on a login page
        return
    }

    const hash = !!window.location.hash ? window.location.hash : '#root&0'
    const parts = `${hash}`.substring(1).split('&')
    const page = parts[0]
    if (page === 'root') {
        // on the trips page
        const index = parseInt(parts[1])
        const allCards = [...document.querySelectorAll("div[data-section-id='PAST_TRIPS'] div[data-testid='reservation-card'] > a")]
        if (index > allCards.length - 1) {
            captureFinished()
        } else {
            const urlBase = window.location.href.split('#')[0]
            const nextURL = `${urlBase}#root&${index+1}`
            const currentURL = `${allCards[index].getAttribute('href')}#detail&${btoa(nextURL)}`
            setTimeout(() => window.location = currentURL, 200)
        }
    } else if (page === 'detail') {
        // on the trip detail page
        const nextURL = atob(parts[1])
        try {
            const stay = extractStayFromDocument()
            captureStay(stay)
            setTimeout(() => window.location = nextURL, 200)
        } catch (e) {
            console.log('airbnb capture failed', e)
            alert('Airbnb capture failed :(')
        }
    }
}

function initDefault() {
    if (window.location.href.includes('trips/v1/')) {
        const stay = extractStayFromDocument()
        const widget = getDownloadStayWidget(stay)
        document.querySelector("div[data-testid='reservations-split-title-subtitle-kicker-row']").appendChild(widget)
    }
}

init(ORIGIN.AIRBNB, initCapture, initDefault)
