function getYearFromURL() {
    const urlParams = new URLSearchParams(window.location.search)
    return parseInt(urlParams.get('year'))
}

class BookingArchivedPage extends Page {
    static path = 'archivedsummary'

    extractStayFromArchivedDocument() {
        const gpsRegex = /GPS coordinates: ([^\n]+)/gi
        const addressRegex = /Address:\n(.+?)\n\n/gis
    
        const bookingID = document.querySelector('.book-num > .book-num__digits').textContent.trim().replace(/\./gi, '')
        const hotelName = document.querySelector('.hotel-details__address h2').textContent.trim()
        const hotelAddressText = document.querySelector('.hotel-details__address').textContent.trim()
        const priceResult = document.querySelector('span.room-price').textContent
        const roomPrice = parseHTMLSpecialSymbols(priceResult)
        const price = priceFromString(roomPrice)
        if (!price) return this.core.sendError('price could not be found', 'extractStayFromDocument')
    
        const gpsResults = gpsRegex.exec(hotelAddressText)
        const addressResults = addressRegex.exec(hotelAddressText)
        const fullAddress = addressResults[1]
    
        if (!fullAddress) return this.core.sendError('full adrress could not be found', 'extractStayFromDocument')
    
        const fullAddressOneLine = fullAddress.replace(/(\r\n|\n|\r)/gm, '')
        const addressComponents = getAddressComponents(fullAddressOneLine)
    
        if (!addressComponents) return this.core.sendError('address components could not be found', 'extractStayFromDocument')
    
        const cc = getCountryCode(addressComponents.country)
        const cords = convertGPSCoordinates(gpsResults[1])
    
        if (!cords) return this.core.sendError('gps coordinates could not be found', 'extractStayFromDocument')
    
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

    async run() {
        const stay = this.extractStay()
        this.core.captureStay(stay)
        window.close()
    }
}