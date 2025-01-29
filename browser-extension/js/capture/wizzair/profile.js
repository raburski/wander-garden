function isFlights(data) {
    return Boolean(data)
}

function parseFlight(data) {
    const flightNo = data.flightNumber.replace(' ', '').trim()
    const id = `wizzair:${data.departureStation}/${data.arrivalStation}/${flightNo}`
    const url = `https://www.wizzair.com/en-gb/itinerary/${data.recordLocator}/${data.contactLastName}`
    
    const operator = 'Wizzair'
    const connectionId = data.recordLocator

    const departureAirport = getAirport(data.departureStation)
    // const arrivalAirport = getAirport(data.arrivalStation)

    const departure = {
        airport: data.departureStation,
        scheduled: getISOTimezoneDateString(departureAirport.lat, departureAirport.lon, new Date(data.departureDate)),
    }
    const arrival = {
        airport: data.arrivalStation,
        // arrival date not provide so using departure one again
        scheduled: getISOTimezoneDateString(departureAirport.lat, departureAirport.lon, new Date(data.departureDate)),
    }

    return {
        id,
        url,
        connectionId,
        flightNo,
        operator,
        departure,
        arrival,
    }
}

function getFlightsFromJSON(json) {
    return json.pastBookingsGrouped.flatMap(f => f)
}

class WizziarProfilePage extends Page {
    static path = '/profile'
    constructor() {
        super()
        this.buttons = undefined
    }

    onNetworkCaptured(url, data) {
        const ORDERS_URL = 'customer/mybookings'
        if (!url.includes(ORDERS_URL)) return
        
        const json = JSON.parse(data)
        const flights = getFlightsFromJSON(json)
            .filter(isFlights)
            .map(parseFlight)
        
        // TODO: work on when multiple pages, more than 10 bookings
        this.core.captureFinished(flights)
    }

    async run() {}
}