function bookingToTour(booking, accountID) {
    const summary = booking.bookingSummaries[0]
    const url = accountID ? `https://www.viator.com/account/booking/${accountID}/${summary.itineraryId}/${summary.itemId}` : undefined
    return {
        id: `${summary.itineraryId}:${summary.itemId}`,
        title: summary.product.name,
        date: `${summary.travelDate.dateIso}T00:00:00+00:00`,
        price: priceFromString(summary.price),
        url,
    }
}

class ViatorBookingsPage extends Page {
    static path = 'account/bookings'

    onNetworkCaptured(url, data) {
        const BOOKINGS_URL = '/bookings'
        if (!url.includes(BOOKINGS_URL)) return
        
        const json = JSON.parse(data)
        const accountId = json.postBookingAppPromotion?.accountId
        const bookings = json.pastOrCancelledBookingSummaries
            .map(booking => bookingToTour(booking, accountId))
            
        bookings.forEach(this.core.capture)

        this.core.captureFinished()
    }

    async run() {}
}