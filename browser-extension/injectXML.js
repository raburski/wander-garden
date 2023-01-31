function isTripsURL(url) {
    return url.startsWith('https://secure.booking.com/trip/timeline')
}

function monkeyPatch() {
    console.log("Injecting Wander Garden secateur.");
    let oldXHROpen = window.XMLHttpRequest.prototype.open
    window.XMLHttpRequest.prototype.open = function() {
        this.addEventListener("load", function() {
        const responseBody = this.responseText;
        if (isTripsURL(this.responseURL)) {
            console.log('Captured', this.responseURL)
            window.postMessage({
                target: 'booking.com_extension',
                type: 'trip_captured',
                data: responseBody,
            }, '*')
        }
        })
        return oldXHROpen.apply(this, arguments)
    }
}

monkeyPatch()
