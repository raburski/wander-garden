class TripAdvisorBookingPage extends Page {
    static path = '/AttractionBookingDetails'
    constructor() {
        super()
        this.tourLinks = undefined
        this.currentLinkIndex = 0
    }

    extractTour() {
        const detailsCard = document.querySelector('.productCard > div :nth-child(2) > div')
        const dateLine = detailsCard.querySelector(':nth-child(2)')
        const priceLine = detailsCard.querySelector(':nth-child(3)')
        const idLine = detailsCard.querySelector(':nth-child(5)')
        
        const id = idLine.textContent.replace(/\D/g, '')
        const title = getRootTextContent(document.querySelector("h1.moduleTitle a"))

        // TODO: consider timezones etc
        const dateString = dateLine.textContent.split(' • ')[0]
        const date = new Date(`${dateString} Z`)
        const priceString = priceLine.textContent
        const price = priceFromString(priceString)

        return {
            id,
            title,
            date: date.toISOString(),
            url: window.location.href,
            price,
        }
    }

    async run() {
        await waitForElement('.tripStatusMapper > .infoLabel')
        await sleep(100)
        const isCompleted = document.querySelector('.tripStatusMapper > .infoLabel.complete') !== null
        if (isCompleted) {
            try {
                const tour = this.extractTour()
                this.core.capture(tour)
            } catch (e) {
                this.core.sendError(e, 'extractTour')
            }
        } else {
            this.core.skipCapture()
        }
    }
}