const AIRBNB_EXPERIENCE = 'EXPERIENCE_RESERVATION'

class AirbnbTripsPage extends Page {
    static path = 'trips/v1'
    constructor(...args) {
        super(...args)
        this.tripURLs = []
        this.currentURLIndex = 0
    }

    onCaptured(message) {
        console.log('Wander Garden: stay captured', message)
        this.processNextTrip()
    }

    processNextTrip() {
        if (!this.tripURLs[this.currentURLIndex]) {
            return this.core.captureFinished()
        }

        const currentURL = this.tripURLs[this.currentURLIndex]
        if (currentURL.toUpperCase().includes(AIRBNB_EXPERIENCE)) {
            this.currentURLIndex = this.currentURLIndex + 1
            return processNextTrip()
        }

        this.core.openWindow(currentURL)
        this.currentURLIndex = this.currentURLIndex + 1
    }

    async loadAllTripCards() {
        const showMoreButton = document.querySelector("div[data-testid='reservation-card-paginate'] > button")
        if (!showMoreButton) {
            return
        }
        showMoreButton.click()
        await sleep(500)
        return this.loadAllTripCards()
    }

    async run() {
        await waitForElement("div[data-section-id='PAST_TRIPS']")
        await this.loadAllTripCards()

        const allCards = [...document.querySelectorAll("div[data-section-id='PAST_TRIPS'] div[data-testid='reservation-card'] > a")]
        this.tripURLs = allCards.map(card => ensureFullURL(card.getAttribute('href')))
        this.processNextTrip()
    }
}