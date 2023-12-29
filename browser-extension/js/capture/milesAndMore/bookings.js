function getFlightsNumbers(text) {
    const cleared = text.replace(/Flights \(/gi, '').replace(/\)/gi, '')
    const parts = cleared.split(' of ')
    return [parseInt(parts[0]), parseInt(parts[1])]
}

function nextDay(date) {
    const currentDate = new Date(date)
    currentDate.setDate(currentDate.getDate() + 1)

    const nextYear = currentDate.getFullYear();
    const nextMonth = currentDate.getMonth() + 1; // Note: months are zero-based
    const nextDay = currentDate.getDate();

    return `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(nextDay).padStart(2, '0')}`;
}

class MilesAndMoreBookingsPage extends Page {
    static path = '/account/my-bookings'
    constructor() {
        super()
        this.root = null
    }

    async setupRoot() {
        await waitForElement("flight-history")
        await sleep(1000)
        this.root = document.querySelector('flight-history').shadowRoot
    }

    async selectLast10Years() {
        await waitForElement("#period", this.root)
        const periodSelector = this.root.querySelector("#period")
        periodSelector.value = '10%20years'
        periodSelector.dispatchEvent(new Event('change'))
        await sleep(4000)
    }

    async loadAllFlights() {
        const root = this.root
        await scrollIntoViewUntil({
            root,
            elementSelector: ".flightdetail",
            isFinishedCheck: () => {
                const flightsHeader = root.querySelector('.flightlist > h2')
                const [loaded, ofAvailable] = getFlightsNumbers(flightsHeader.innerText)
                return loaded >= ofAvailable
            },
        })
        root.querySelector("#period").scrollIntoView()
        await sleep(300)
    }

    async captureFlightDetails() {
        const flights = []
        const all = this.root.querySelectorAll("a[href='#show-details']")
        for (let i = 0; i < all.length; i++) {
            const link = all[i]
            link.click()
            await sleep(200)
            const date = link.querySelector('.date').textContent
            const flight = await this.captureOpenFlight(date)
            flights.push(flight)
        }
        return flights
    }

    async captureOpenFlight(date) {
        const timeRegex = /[0-9][0-9]\:[0-9][0-9]/gi

        const flightNo = this.root.querySelector('.flightinfo > .item > .info').textContent.trim()
        const operatedBy = this.root.querySelector('.flightinfo > .item > .label').textContent.replace('Operated by ', '')
        const startAirportCode = this.root.querySelector('.wc-departure > .wc-origin > .wc-airport-code > .info').textContent
        const endAirportCode = this.root.querySelector('.wc-arrival > .wc-destination > .wc-airport-code > .info').textContent
        const scheduledDepartureText = this.root.querySelector('.wc-departure > .wc-origin > .wc-airport-code > .detail').textContent
        const scheduledArrivalText = this.root.querySelector('.wc-arrival > .wc-destination > .wc-airport-code > .detail').textContent

        const scheduledDeparture = scheduledDepartureText.match(timeRegex)[0]
        const scheduledArrival = scheduledArrivalText.match(timeRegex)[0]

        const departureAirport = getAirport(startAirportCode)
        const arrivalAirport = getAirport(endAirportCode)
        if (!departureAirport) {
            throw new Error(`Departure airport not recognised (${startAirportCode})`)
        }
        if (!arrivalAirport) {
            throw new Error(`Arrival airport not recognised (${endAirportCode})`)
        }

        const departureDate = new Date(`${date} ${scheduledDeparture} Z`)
        const arrivalDate = parseInt(scheduledDeparture) > parseInt(scheduledArrival) ? 
            new Date(`${nextDay(date)} ${scheduledArrival} Z`) // arrival is the next day
            : new Date(`${date} ${scheduledArrival} Z`)

        return {
            id: `${date}-${flightNo}`,
            flightNo,
            operator: operatedBy,
            departure: {
                airport: startAirportCode,
                scheduled: getISOTimezoneDateString(departureAirport.lat, departureAirport.lon, departureDate),
            },
            arrival: {
                airport: endAirportCode,
                scheduled: getISOTimezoneDateString(arrivalAirport.lat, arrivalAirport.lon, arrivalDate),
            },
        }
    }

    async run() {
        await this.setupRoot()
        await this.selectLast10Years()
        await this.loadAllFlights()
        const flights = await this.captureFlightDetails()
        this.core.captureFinished(flights)
    }
}