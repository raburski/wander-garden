function extractStayFromDocument() {
    const idRegex = /\/trips\/v[0-9]\/([^\/]+)\//g
    const cityRegex = /( in )(.(?<! in ))+$/g

    const accomodationElement = document.querySelector("a[data-testid='reservation-destination-link']")
    if (!accomodationElement) return undefined
    const accomodationURL = accomodationElement.getAttribute('href')
    const nameElement = accomodationElement.querySelectorAll("a[data-testid='reservation-destination-link'] span")[2]
    if (!nameElement) return undefined
    const accomodationName = parseHTMLSpecialSymbols(nameElement.innerHTML)

    const priceElements = [...document.querySelectorAll("div[data-testid='reservation-title-subtitle'] p")]
        .map(e => priceFromString(parseHTMLSpecialSymbols(e.innerHTML)))
        .filter(e => e)
    const price = priceElements.length === 1 ? priceElements[0] : undefined
    if (!price) {
        return undefined
    }

    const id = idRegex.exec(window.location.href)[1]
    const dataState = JSON.parse(document.getElementById('data-state').innerHTML)
    if (!id || !dataState) return undefined

    const guestsElemenet = document.querySelector("[data-testid=avatar-list-row] > div > div p")
    const guestsArray = guestsElemenet?.innerHTML?.split(' ').map(parseInt).filter(Boolean)
    const totalGuests = guestsArray?.length === 1 ? guestsArray[0] : undefined

    const reservations = dataState.bootstrapData.reduxData.reservations
    const reservationKeys = Object.keys(reservations)
    const metadata = reservations[reservationKeys[0]].metadata
    const city = cityRegex.exec(metadata.title)[0].substring(4)
    const cc = metadata.country

    if (!city || !cc || !accomodationName) {
        return undefined
    }

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
        totalGuests,
        price,
    }
}

const AIRBNB_EXPERIENCE = 'EXPERIENCE_RESERVATION'
function openDetailPage(index, captureFinished) {
    const allCards = [...document.querySelectorAll("div[data-section-id='PAST_TRIPS'] div[data-testid='reservation-card'] > a")]
    if (index > allCards.length - 1) {
        captureFinished()
    } else {
        const urlBase = window.location.href.split('#')[0]
        const nextURL = `${urlBase}#root&${index+1}`
        const currentURL = `${allCards[index].getAttribute('href')}#detail&${btoa(nextURL)}`

        console.log('NEXT URL: ', currentURL)
        if (currentURL.toUpperCase().includes(AIRBNB_EXPERIENCE)) {
            return openDetailPage(index + 1, captureFinished)
        }
        setTimeout(() => window.location = currentURL, 200)
    }
}

function initCapture({ captureStay, captureFinished, lastCapturedStayID }) {
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
        openDetailPage(index, captureFinished)
    } else if (page === 'detail') {
        // on the trip detail page
        const nextURL = atob(parts[1])
        try {
            const stay = extractStayFromDocument()
            if (stay && stay?.id === lastCapturedStayID) {
                captureFinished()
            } else if (stay) {
                captureStay(stay)
                setTimeout(() => window.location = nextURL, 200)
            } else {
                // TODO: report failed data scrape
                setTimeout(() => window.location = nextURL, 2200)
            }
        } catch (e) {
            console.log('airbnb capture failed', e)
            alert('Airbnb capture failed :(')
        }
    }
}

function addDownloadWidget() {
    if (window.location.href.includes('trips/v1/')) {
        const stay = extractStayFromDocument()
        if (!stay) return
        const widget = getDownloadStayWidget(stay)
        if (!document.getElementById(widget.id)) {
            document.querySelector("div[data-testid='reservations-split-title-subtitle-kicker-row']").appendChild(widget)
        }
    }
}

function turnTripURLsIntoRedirects() {
    document.querySelectorAll("div[data-section-id='PAST_TRIPS'] a").forEach(element => {
        element.onclick = function(event) {
            event.stopPropagation()
            event.preventDefault()

            window.location = element.getAttribute('href')
        }
    })
}

function initDefault() {
    turnTripURLsIntoRedirects()
    addDownloadWidget()
}

init(ORIGIN.AIRBNB, initCapture, initDefault)
