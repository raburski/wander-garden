class BookingTripsPage extends Page {
    static path = ['mytrips', 'myreservations']
    constructor(...args) {
        super(...args)
        this.tripLinks = []
        this.currentURLIndex = 0
    }

    onCaptured(message) {
        console.log('Wander Garden: stay captured', message)
        this.processNextTrip()
    }

    processNextTrip() {
        if (!this.tripLinks[this.currentURLIndex]) {
            return this.core.captureFinished()
        }

        const link = this.tripLinks[this.currentURLIndex]
        if (!link.href.includes(BookingArchivedPage.path) && !link.href.includes(BookingConfirmationPage.path)) {
            this.currentURLIndex = this.currentURLIndex + 1
            return this.processNextTrip()
        }

        const dateString = link.querySelector('span:not([aria-hidden])').textContent
        let year = parseInt(dateString.split(' ').pop()) 
        if (!year) {
            year = new Date().getFullYear()
        }

        this.core.openWindow(`${link.href}&year=${year}`)
        this.currentURLIndex = this.currentURLIndex + 1
    }

    startOpeningStays() {
        this.tripLinks = document.querySelectorAll("#mytrips-mfe > div > div > a")
        if (this.tripLinks.length === 0) {
            console.log('[WARNING] Wander Garden: no trip urls detected')
        }
        this.processNextTrip()
    }

    async run() {
        await scrollIntoViewUntil({
            elementSelector: "#mytrips-mfe > div > div > div > div",
            isFinishedCheck: element => !element || element.classList.length < 2 || element.classList.toString().includes('csxp'),
        })
        await this.startOpeningStays()
    }
}