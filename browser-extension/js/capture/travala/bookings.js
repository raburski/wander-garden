function isCompletedStay(data) {
    return data.status === 'BOOKING_SUCCESS'
}

function getISODateFromNumber(lat, lng, number, time = '') {
    const string = `${number}`
    const year = string.slice(0, 4)
    const month = string.slice(4, 6)
    const day = string.slice(6, 8)
    return getISOTimezoneDateString(lat, lng, `${year}-${month}-${day} ${time}`)
}

function sanitiseCountry(name) {
    return name.replace(' the', '')
}

function receiptDataToStay(data) {
    const id = `travala:${data.order_id}`
    const url = `https://www.travala.com/booking-summary/${data.order_id}`
    const since = getISODateFromNumber(data.property_info.lat, data.property_info.lng, data.from_date, '15:00')
    const until = getISODateFromNumber(data.property_info.lat, data.property_info.lng, data.to_date, '11:00')
    const hotelUrl = `https://www.travala.com/en/hotel/${data.property_info.slug}`

    const currency = data.user_currency
    const amount = data.total_prices[currency]
    
    return {
        id,
        url,
        since,
        until,
        location: {
            address: data.property_info.street_address,
            city: data.property_info.city_name,
            country: sanitiseCountry(data.property_info.country_name),
            cc: data.property_info.country_code.toLowerCase(),
            lat: data.property_info.lat,
            lng: data.property_info.lng,
        },
        accomodation: {
            name: data.property_info.name,
            url: hotelUrl,
        },
        price: {
            amount,
            currency,
        },
    }
}

class TravalaBookingsPage extends Page {
    static path = 'my-bookings'
    constructor() {
        super()
        this.stays = undefined
    }

    onNetworkCaptured(url, data) {
        const ORDERS_URL = 'orders/receipt'
        if (!url.includes(ORDERS_URL)) return
        
        const json = JSON.parse(data)
        this.stays = json.data
            .filter(isCompletedStay)
            .map(receiptDataToStay)
            
        this.stays.forEach(this.core.capture)
        
        // TODO: work on when multiple pages, more than 10 bookings
        this.core.captureFinished()
    }

    async run() {}
}