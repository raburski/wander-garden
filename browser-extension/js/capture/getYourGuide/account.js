class GetYourGuideAccountPage extends Page {
    static path = 'account'

    async run() {
        window.location.replace('https://www.getyourguide.com/customer-bookings')
    }
}