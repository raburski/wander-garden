function isFlights(data) {
    return data.flights && data.flights.length > 0
}

function parseFlightSegment(data, tripId) {
    const flightNo = data.flightNumber.replace(' ', '').trim()
    const id = `ryanair:${data.origin}/${data.destination}/${flightNo}`
    const url = `https://www.ryanair.com/gb/en/trip/manage/${tripId}`
    
    const operator = 'Ryanair'
    const connectionId = tripId

    const departureAirport = getAirport(data.origin)
    const arrivalAirport = getAirport(data.destination)

    const departure = {
        airport: data.origin,
        scheduled: getISOTimezoneDateString(departureAirport.lat, departureAirport.lon, new Date(data.departureTime)),
    }
    const arrival = {
        airport: data.destination,
        scheduled: getISOTimezoneDateString(arrivalAirport.lat, arrivalAirport.lon, new Date(data.arrivalTime)),
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

function itemToFlights(item) {
    return item.flights
        .flatMap(f => f.journeys)
        .flatMap(j => j.segments)
        .map(s => parseFlightSegment(s, item.tripId))
}

class RyanairManagePage extends Page {
    static path = '/trip/manage'
    constructor() {
        super()
        this.buttons = undefined
    }

    onNetworkCaptured(url, data) {
        const ORDERS_URL = 'orders/v2/orders'
        if (!url.includes(ORDERS_URL)) return
        
        const json = JSON.parse(data)
        const flights = json.items
            .filter(isFlights)
            .flatMap(itemToFlights)
        
        // TODO: work on when multiple pages, more than 10 bookings
        this.core.captureFinished(flights)
    }

    async run() {}
}