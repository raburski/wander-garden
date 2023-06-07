let tripLinks = []
let currentURLIndex = 0
let currentWindow = undefined

function convertGPSCoordinates(gpsCoordinates) {
    // Extract latitude and longitude components from the input string
    const regex = /([NS]) (\d+)° (\d+\.\d+), ([EW]) (\d+)° (\d+\.\d+)/;
    const match = gpsCoordinates.match(regex);
  
    // Check if the input string matches the expected format
    if (!match) {
      return undefined
    }
  
    // Extract the relevant components from the regex match
    const latitudeDirection = match[1];
    const latitudeDegrees = Number(match[2]);
    const latitudeMinutes = Number(match[3]);
    const longitudeDirection = match[4];
    const longitudeDegrees = Number(match[5]);
    const longitudeMinutes = Number(match[6]);
  
    // Convert degrees and minutes to decimal degrees
    const latitudeDecimal = latitudeDegrees + latitudeMinutes / 60;
    const longitudeDecimal = longitudeDegrees + longitudeMinutes / 60;
  
    // Determine the sign of the latitude and longitude based on the direction
    const latitude = latitudeDirection === "N" ? latitudeDecimal : -latitudeDecimal;
    const longitude = longitudeDirection === "E" ? longitudeDecimal : -longitudeDecimal;
  
    // Return the latitude and longitude as an object
    return { latitude, longitude }
}

function clickLoadMoreButtonUntilGone(callback, lastTime = false) {
    const button = document.querySelector("#mytrips-mfe > button")
    const text = button ? button.innerText : ''
    if (button && text.length > 6) { // View more bookings
        button.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true}))
        setTimeout(function() { clickLoadMoreButtonUntilGone(callback, lastTime) }, 300)
    } else if (button) { // Loading indicator
        setTimeout(function() { clickLoadMoreButtonUntilGone(callback, lastTime) }, 300)
    } else { // button gone
        if (lastTime) {
            callback()
        } else {
            function oneAdditionalTimeCallback() {
                setTimeout(function() { clickLoadMoreButtonUntilGone(callback, true) }, 300)
            }
            setTimeout(function() { clickLoadMoreButtonUntilGone(oneAdditionalTimeCallback, true) }, 300)
        }
    }
}

function isArchivedSummeryLink(url) {
    return url.includes('archivedsummary')
}

function initMyTrips(onStayCaptured, captureFinished, lastCapturedStayID) {
    function processNextTrip() {
        if (!tripLinks[currentURLIndex]) {
            return captureFinished()
        }

        const link = tripLinks[currentURLIndex]
        if (!isArchivedSummeryLink(link.href)) {
            currentURLIndex = currentURLIndex + 1
            return processNextTrip()
        }

        const dateString = link.querySelector('span:not([aria-hidden])').textContent
        let year = parseInt(dateString.split(' ').pop()) 
        if (!year) {
            year = new Date().getFullYear()
        }

        currentWindow = window.open(`${link.href}&year=${year}`, '_blank')
        currentURLIndex = currentURLIndex + 1
    }

    function startOpeningStays() {
        tripLinks = document.querySelectorAll("#mytrips-mfe > div > div > a")
        if (tripLinks.length === 0) {
            console.log('[WARNING] Wander Garden: no trip urls detected')
        }
        processNextTrip()
    }

    onStayCaptured(function(message) {
        console.log('Wander Garden: stay captured', message)
        currentWindow.close()
        if (lastCapturedStayID && message.stay.id === lastCapturedStayID) {
            return captureFinished()
        }
        processNextTrip()
    })

    clickLoadMoreButtonUntilGone(startOpeningStays)
}

function getYearFromURL() {
    const urlParams = new URLSearchParams(window.location.search)
    return parseInt(urlParams.get('year'))
}

function isPotentialPostcode(string) {
    const genericPattern = /^[0-9A-Z\s-]+$/
    return genericPattern.test(string)
}

function getAddressComponents(string) {
    const parts = string.split(',').map(s => s.trim()).filter(s => !isPotentialPostcode(s))
    const country = parts.pop()
    const city = parts.pop().split(' ').filter(s => !isPotentialPostcode(s)).join(' ')
    const address = parts.join(', ')

    return {
        address,
        city,
        country,
    }
}

function extractStayFromDocument() {
    const gpsRegex = /GPS coordinates: ([^\n]+)/gi
    const addressRegex = /Address:\n(.+?)\n\n/gis

    const bookingID = document.querySelector('.book-num > .book-num__digits').textContent.trim()
    const hotelName = document.querySelector('.hotel-details__address h2').textContent.trim()
    const hotelAddressText = document.querySelector('.hotel-details__address').textContent.trim()
    const priceResult = document.querySelector('span.room-price').textContent
    const roomPrice = priceResult.replace('&nbsp;', ' ').replace(' ', ' ').trim().split(' ')
    const price = { amount: parseFloat(roomPrice[1]), currency: convertCurrencySymbol(roomPrice[0]) }

    const gpsResults = gpsRegex.exec(hotelAddressText)
    const addressResults = addressRegex.exec(hotelAddressText)
    const fullAddress = addressResults[1]

    if (!fullAddress) return undefined

    const fullAddressOneLine = fullAddress.replace(/(\r\n|\n|\r)/gm, '')
    const addressComponents = getAddressComponents(fullAddressOneLine)

    if (!addressComponents) return undefined

    const cc = getCountryCode(addressComponents.country)
    const cords = convertGPSCoordinates(gpsResults[1])

    if (!cords) return undefined

    const year = getYearFromURL()
    const datesElement = document.getElementsByClassName('dates')[0]
    const dayElements = datesElement.querySelectorAll('.summary__big-num')
    const monthElements = datesElement.querySelectorAll('.dates__month')

    const dateSince = new Date(`${monthElements[0].textContent} ${dayElements[0].textContent}, ${year}`)
    const dateUntil = new Date(`${monthElements[1].textContent} ${dayElements[1].textContent}, ${year}`)

    return {
        id: `booking:${bookingID}`,
        url: window.location.href,
        since: dateSince.toISOString(),
        until: dateUntil.toISOString(),
        location: {
            ...addressComponents,
            cc,
            lat: cords.latitude,
            lng: cords.longitude,
        },
        accomodation: {
            name: hotelName,
        },
        price,
    }
}

function initSummary(captureStay) {
    const stay = extractStayFromDocument()
    captureStay(stay)
}

function initCapture({ captureStayPartial, captureStay, captureFinished, lastCapturedStayID, onStayCaptured }) {
    console.log('onINIT capture')
    if (window.location.href.includes('password')) {
        // on a login page
        return
    } else if (window.location.href.includes('mybooking_archivedsummary')) {
        initSummary(captureStay)
    } else if (window.location.href.includes('mytrips')) {
        initMyTrips(onStayCaptured, captureFinished, lastCapturedStayID)
    }
}

// function addLinkWidget(stay, widget) {
//     const link = document.querySelector(`a[href^='${stay.url}'] div div`)
//     if (link) {
//         link.appendChild(widget)
//     } else {
//         setTimeout(function () {addLinkWidget(stay, widget)}, 500)
//     }
// }

function initDefault() {
    console.log('init defaults')

    // const widget = getDownloadStayWidget(stay)
    // widget.style.position = 'absolute'
    // widget.style.right = '22px'
    // widget.style.marginTop = '-44px'
    // addLinkWidget(stay, widget)
}

init(ORIGIN.BOOKING, initCapture, initDefault)