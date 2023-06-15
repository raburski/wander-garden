
function isCompletedStay(data) {
    return data.status === 'BOOKING_SUCCESS'
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

function receiptDataToStay(data) {
    const id = `travala:${data.order_id}`
    const url = `https://www.travala.com/booking-summary/${data.order_id}`
    const since = getISODateFromNumber(data.from_date)
    const until = getISODateFromNumber(data.to_date)
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

function initCapture({ captureStayPartial, captureStay, captureFinished, lastCapturedStayID, onStayCaptured, onNetworkCaptured }) {

    const ORDERS_URL = 'orders/receipt'
    onNetworkCaptured(function(url, data) {
        if (!url.includes(ORDERS_URL)) return
        
        const json = JSON.parse(data)
        const stays = json.data
            .filter(isCompletedStay)
            .map(receiptDataToStay)
            
        stays.forEach(captureStay)

        if (stays.some(stay => stay.id === lastCapturedStayID)) {
            captureFinished()
        }
        
        // TODO: work on when multiple pages, more than 10 bookings
        captureFinished()
    })
    
}

init(ORIGIN.TRAVALA, initCapture)