class AirbnbTripPage extends Page {
    static path = 'trips/v1/'

    constructor() {
        super()
        this.dataState = JSON.parse(document.getElementById('data-injector-instances').innerHTML)
    }

    extractStay() {
        const idRegex = /\/trips\/v[0-9]\/(reservation-details\/..\/)?(RESERVATION.?_CHECKIN\/)?([^\/$]+)\/?.*/g
        const cityRegex = /( in )(.(?<! in ))+$/g
    
        let accomodationURL
        let accomodationName
        let price = undefined
    
        try {
            const accomodationElement = document.querySelector("a[data-testid='reservation-destination-link']")
            if (!accomodationElement) return undefined
            accomodationURL = accomodationElement.getAttribute('href')
            const nameElement = accomodationElement.querySelectorAll("a[data-testid='reservation-destination-link'] span")[2]
            if (!nameElement) return undefined
            accomodationName = parseHTMLSpecialSymbols(nameElement.innerHTML)
        } catch (e) {
            return this.core.sendError(e, 'extractName')
        }
        
        try {
            const priceElements = [...document.querySelectorAll("div[data-testid='reservation-title-subtitle'] p")]
                .map(e => priceFromString(parseHTMLSpecialSymbols(e.innerHTML)))
                .filter(e => e)
            price = priceElements.length === 1 ? priceElements[0] : undefined
            if (!price) {
                throw new Error('price not found')
            }
        } catch (e) {
            // alert('PRICE NOT FOUND')
            // return this.core.sendError(e, 'extractPrice')
        }
    
        const guestsElemenet = document.querySelector("[data-testid=avatar-list-row] > div > div p")
        const guestsArray = guestsElemenet?.innerHTML?.split(' ').map(parseInt).filter(Boolean)
        const totalGuests = guestsArray?.length === 1 ? guestsArray[0] : undefined
    
        const id = idRegex.exec(window.location.href)[3]
        if (!id) {
            return this.core.sendError('no id can be found', 'extractStay')
        }

        const hyperloop = this.dataState["root > core-guest-spa"].find(pair => pair[0].includes('Hyperloop'))
        if (!hyperloop) {
            return this.core.sendError('No hyperloop object found', 'extractMetadata')
        }
        const uiState = hyperloop[1].uiState[0][1]
        const metadata = uiState.metadata
        const city = cityRegex.exec(metadata.title)[0].substring(4)
        const cc = metadata.country
    
        if (!city || !cc || !accomodationName) {
            return this.core.sendError('no city, cc, or accomodationName can be found', 'extractStay')
        }
    
        return {
            id: `airbnb:${id}`,
            url: window.location.href,
            since: getISOTimezoneDateString(metadata.lat, metadata.lng, `${metadata.check_in_date} 15:00`),
            until: getISOTimezoneDateString(metadata.lat, metadata.lng, `${metadata.check_out_date} 11:00`),
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

    async run() {
        const stay = this.extractStay()
        if (stay) {
            this.core.capture(stay)
        } else {
            this.core.skipCapture()
        }
    }
}