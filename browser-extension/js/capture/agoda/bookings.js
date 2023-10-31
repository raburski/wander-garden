function isBookingCompleted(booking) {
    return booking?.bookingStatus?.phase === 'Departed' || booking?.bookingStatus?.phase === 'Completed'
}

class AgodaBookingsPage extends Page {
    static path = 'account/bookings'

    constructor() {
        super()
        this.currentBookingIndex = 0
        this.bookingIDs = []
    }

    onStayCaptured(message) {
        console.log('Wander Garden: stay captured', message)
        this.processNextBooking()
    }

    onNetworkCaptured(url, data) {
        const ORDERS_URL = 'GetBookingsList'
        if (!url.includes(ORDERS_URL)) return
        
        const json = JSON.parse(data)
        const bookingIDs = json.bookings
            .filter(isBookingCompleted)
            .map(booking => booking.legacyBookingToken)
        if (bookingIDs.length <= 0) return

        this.bookingIDs = bookingIDs
        this.currentBookingIndex = 0
        this.processNextBooking()
    }

    async openNextPage() {
        const buttons = [...document.querySelectorAll("#mmb-bookings-container > div > div > button")]
        const nextButton = buttons[buttons.length - 1]
    
        if (nextButton.disabled) {
            this.core.captureFinished()
        } else {
            nextButton.click()
        }
    }
    
    async processNextBooking() {
        console.log('check', this.currentBookingIndex, this.bookingIDs.length)
        if (this.currentBookingIndex >= this.bookingIDs.length) {
            return await this.openNextPage()
        }

        const bookingId = encodeURIComponent(this.bookingIDs[this.currentBookingIndex])
        const url = `https://www.agoda.com/account/editbooking.html?BookingId=${bookingId}`
        this.currentBookingIndex = this.currentBookingIndex + 1
        await sleep(100)
        console.log('oprn', url)
        this.core.openWindow(url)
    }

    async openCompletedBookingsPage() {
        const completedTabButton = document.getElementById('mmb-booking-phase-tabs-tab-2')
        if (completedTabButton.getAttribute('aria-selected') === 'false') {
            completedTabButton.click()
        }
    }

    async run() {
        await this.openCompletedBookingsPage()
    }
}