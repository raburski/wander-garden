class GetYourGuideBookingsPage extends Page {
    static path = 'customer-bookings'
    constructor() {
        super()
        this.tourLinks = undefined
        this.currentLinkIndex = 0
    }

    processNext() {
        const currentLink = this.tourLinks[this.currentLinkIndex]
        if (currentLink) {
            this.core.openWindow(currentLink)
            this.currentLinkIndex = this.currentLinkIndex + 1
        } else {
            this.core.captureFinished()
        }
    }

    onCaptured() {
        this.processNext()
    }

    async run() {
        await waitForElement(".my-bookings__bookings-list")
        this.tourLinks = [...document.querySelectorAll('.confirmation-item__details-booking-summary-link > a')]
            .map(e => e.getAttribute('href'))
            .map(url => ensureFullURL(url))
        this.processNext()
    }
}