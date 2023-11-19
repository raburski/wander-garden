class TripAdvisorBookingsPage extends Page {
    static path = '/bookings'
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
        await waitForElement(".react-container > span")
        this.tourLinks = [...document.querySelectorAll(".react-container > span > div a")]
            .map(e => e.getAttribute('href'))
            .filter(url => url.includes('AttractionBookingDetails'))
            .map(url => ensureFullURL(url))
        this.processNext()
    }
}