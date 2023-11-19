function injectExtractScript() {
    var s = document.createElement('script');
    s.src = chrome.runtime.getURL('inject/windowExtract.js');
    s.onload = function() {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
}

function dataToStay(data) {
    const since = data.BookingItem.Dates.CheckInDateNonCulture
    const until = data.BookingItem.Dates.CheckOutDateNonCulture
    const cc = getCountryCode(data.BookingItem.Property.Address.Country)
    const Costs = data.BookingItem.PaymentDetails.NonCancelledPaymentDetails.Costs
    const currency = Costs[0].Amount.Currency
    const allTheSameCurrency = Costs.length > 0 ? Costs.every(c => c.Amount.Currency === currency) : false
    const amount = Costs.reduce((a, c) => a + c.Amount.AmountAsDouble, 0)
    const totalGuests = data.BookingItem.Guests.SecondaryGuests.length + 1

    return {
        id: `agoda:${data.BookingItem.BookingId}`,
        url: window.location.href,
        since: `${since}T00:00:00+00:00`,
        until: `${until}T00:00:00+00:00`,
        totalGuests,
        location: {
            address: [data.BookingItem.Property.Address.Address1, data.BookingItem.Property.Address.Address2].filter(Boolean).join(', '),
            city: data.BookingItem.Property.Address.City,
            country: countryCodeToName[cc.toUpperCase()],
            cc: cc.toLowerCase(),
            lat: data.BookingItem.Property.GeoInfo.Latitude,
            lng: data.BookingItem.Property.GeoInfo.Longitude,
        },
        accomodation: {
            name: data.BookingItem.Property.PropertyName,
            url: ensureFullURL(data.BookingItem.Property.PropertyUrl),
        },
        price: allTheSameCurrency ? {
            amount,
            currency,
        } : undefined
    }
}

class AgodaEditBookingPage extends Page {
    static path = 'editbooking'

    run() {
        const capture = this.core.capture
        window.addEventListener('message', function(event) {
            const message = event.data
            if (message && message.target === ORIGIN.AGODA) {
                console.log('something data', message.data)
                const stay = dataToStay(message.data)
                capture(stay)
            }
        })
        injectExtractScript()
    }
}
