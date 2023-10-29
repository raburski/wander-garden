class ConfirmationPage extends Page {
    static path = 'confirmation.'

    isCompletedConfirmation() {
        return document.getElementsByClassName('reservation-status__title-status--completed').length === 1
    }

    extractStay() {
        const gpsRegex = /markers=([^&]+)/gi

        const bookingID = document.querySelector('.booknumber-pincode-item span').textContent.trim().replace(/\./gi, '')
        const hotelName = document.querySelector('div[data-c360-id=hotelTitle]').textContent.trim()
    
        const hotelAddressElements = document.querySelectorAll('#confirmation-property-section-ddot > div > div > div > div')
        const hotelAddressText = hotelAddressElements[hotelAddressElements.length - 2].textContent.trim()
        if (!hotelAddressText) return this.core.sendError('full adrress could not be found', 'extractStayFromDocument')
        const addressComponents = getAddressComponents(hotelAddressText)
        if (!addressComponents) return this.core.sendError('address components could not be found', 'extractStayFromDocument')
        const cc = getCountryCode(addressComponents.country)
    
        const priceResult = document.querySelector('span.room-price').textContent
        const roomPrice = parseHTMLSpecialSymbols(priceResult)
        const price = priceFromString(roomPrice)
        if (!price) return this.core.sendError('price could not be found', 'extractStayFromDocument')
    
        const gpsText = document.querySelector('.bhpb_print_property_map').src
        const gpsResults = gpsRegex.exec(gpsText)
        const cordsString = gpsResults[1]
        if (!cordsString) return this.core.sendError('gps coordinates could not be found', 'extractStayFromDocument')
        const coordElemenets = cordsString.split(',')
        const cords = {
            lat: parseFloat(coordElemenets[0]),
            lng: parseFloat(coordElemenets[1])
        }
        
        // format: Wed 4 Oct 2023
        const datesElements = [...document.querySelectorAll('time > div:first-of-type')]
            .map(dateElement => dateElement.textContent)
            .map(string => string.split(' '))
            .map(components => new Date(`${components[1]} ${components[2]} ${components[3]}`))
        if (datesElements.length < 2) return this.core.sendError('stay date could not be found', 'extractStayFromDocument')
    
        return {
            id: `booking:${bookingID}`,
            url: window.location.href,
            since: datesElements[0].toISOString(),
            until: datesElements[1].toISOString(),
            location: {
                ...addressComponents,
                ...cords,
                cc,
            },
            accomodation: {
                name: hotelName,
            },
            price,
        }
    }

    run() {
        if (this.isCompletedConfirmation()) {
            const stay = this.extractStay()
            this.core.captureStay(stay)
        } else {
            this.core.skipCapture()
        }
        window.close()
    }
}
