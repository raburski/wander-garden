class GetYourGuideBookingPage extends Page {
    static path = '/booking/'
    constructor() {
        super()
        this.tourLinks = undefined
        this.currentLinkIndex = 0
    }

    extractTour() {
        const hrefComponents = window.location.href.split('/')
        const id = hrefComponents[hrefComponents.length - 1]
        const title = document.querySelector("div[data-test-id='booking-title']").textContent
        const dateString = document.querySelector("p[data-test-id='start-time']").textContent
        const dateComponents = dateString.split(', ')
        const date = new Date(`${dateComponents[1]} ${dateComponents[2].replace('at ', '')} Z`)
        const priceString = document.querySelector('.booking-details__price > span').textContent
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
        const tour = this.extractTour()
        this.core.capture(tour)
    }
}