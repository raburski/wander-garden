function isCompletedFlight(data) {
    return data.status === 'complete'
}

function getISODateFromNumber(number) {
    const string = `${number}`
    const year = string.slice(0, 4)
    const month = string.slice(4, 6)
    const day = string.slice(6, 8)
    return `${year}-${month}-${day}T00:00:00+00:00`
}

function sanitiseCountry(name) {
    return name.replace(' the', '')
}

function getISOTimezoneOffsetedDateString(datetime, offset) {
    const utcDate = new Date(datetime)
    const localDate = new Date(utcDate.getTime() + (offset * 60 * 60 * 1000))
    const formattedOffset = `${offset >= 0 ? '+' : '-'}${String(offset).padStart(2, '0')}:00`
    const isoDateString = localDate.toISOString().replace('Z', formattedOffset)
    return isoDateString
}

function sectorToFlight(connectionId, cabin, data) {
    const id = `travala:flight:${data.id}`
    const url = `https://www.travala.com/flights/booking-summary/${connectionId}`
    const flightNo = `${data.airline}${data.flightNr}`
    const operator = data.airlineInfo.name

    const departure = {
        airport: data.origin,
        scheduled: getISOTimezoneOffsetedDateString(data.departure, data.departureOffset),
    }
    const arrival = {
        airport: data.destination,
        scheduled: getISOTimezoneOffsetedDateString(data.arrival, data.arrivalOffset),
    }

    return {
        id,
        url,
        connectionId,
        flightNo,
        cabin,
        operator,
        departure,
        arrival,
    }
}

function rowToFlights(data) {
    const connectionId = data.id
    const cabin = data.class
    const sectors = data.flightSectors.reverse()
    return sectors.map(sector => sectorToFlight(connectionId, cabin, sector))
}

class TravalaFlightsPage extends Page {
    static path = 'flights/my-bookings'

    onNetworkCaptured(url, data) {
        const ORDERS_URL = 'v2/bookings'
        if (!url.includes(ORDERS_URL)) return
        
        const json = JSON.parse(data)
        const flights = json.rows
            .filter(isCompletedFlight)
            .flatMap(rowToFlights)
        
        // TODO: work on when multiple pages, more than 10 bookings
        this.core.captureFinished(flights)
    }

    async run() {}
}