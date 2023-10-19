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

function scrollToBottomUntilLoadingGone(callback) {
    const items = [...document.querySelectorAll("#mytrips-mfe > div > div > div > div ")]
    const lastItem = items[items.length-1]
    const isLoading = lastItem.classList.length >= 2 && !lastItem.classList.toString().includes('csxp')
    if (isLoading) {
        lastItem.scrollIntoView()
        setTimeout(function() { scrollToBottomUntilLoadingGone(callback) }, 300)
    } else {
        callback()
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

    scrollToBottomUntilLoadingGone(startOpeningStays)
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
    const roomPrice = parseHTMLSpecialSymbols(priceResult)
    const price = priceFromString(roomPrice)
    if (!price) return onError('price could not be found', 'extractStayFromDocument')

    const gpsResults = gpsRegex.exec(hotelAddressText)
    const addressResults = addressRegex.exec(hotelAddressText)
    const fullAddress = addressResults[1]

    if (!fullAddress) return onError('full adrress could not be found', 'extractStayFromDocument')

    const fullAddressOneLine = fullAddress.replace(/(\r\n|\n|\r)/gm, '')
    const addressComponents = getAddressComponents(fullAddressOneLine)

    if (!addressComponents) return onError('address components could not be found', 'extractStayFromDocument')

    const cc = getCountryCode(addressComponents.country)
    const cords = convertGPSCoordinates(gpsResults[1])

    if (!cords) return onError('gps coordinates could not be found', 'extractStayFromDocument')

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

function initSummary(captureStay, onError) {
    try {
        const stay = extractStayFromDocument(onError)
        if (stay) {
            captureStay(stay)
        }
    } catch (e) {
        onError(e, 'extractStayFromDocument')
    }
}

function initCapture({ captureStayPartial, captureStay, captureFinished, lastCapturedStayID, onStayCaptured, onError }) {
    if (window.location.href.includes('password')) {
        // on a login page
        return
    } else if (window.location.href.includes('mybooking_archivedsummary')) {
        initSummary(captureStay, onError)
    } else if (window.location.href.includes('mytrips') || window.location.href.includes('myreservations')) {
        initMyTrips(onStayCaptured, captureFinished, lastCapturedStayID)
    }
}

init(ORIGIN.BOOKING, initCapture)