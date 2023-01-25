const ORIGIN = globalThis.ORIGIN
const browser = chrome

let LOADING_TRIPS = true
let CAPTURING = false
let ALL_STAYS = []
function onExtensionMessage(message) {
    if (message.source !== ORIGIN.EXTENSION) {
        return
    }
    
    if (message.type === 'init' && message.start_capture) {
        CAPTURING = true
        if (!LOADING_TRIPS) {
            findViewMoreBookings()
        }
    }
}

function onCaptureFinished() {
    browser.runtime.sendMessage({ source: ORIGIN.BOOKING, target: ORIGIN.EXTENSION, type: 'capture_finished', stays: ALL_STAYS })
}

browser.runtime.onMessage.addListener(onExtensionMessage)

function stayFromReservation(reservation) {
    const data = reservation.reservation_data
    return {
        id: data.public_id,
        since: data.reservation_start,
        until: data.reservation_end,
        location: {
            address: data.hotel.location.address.value,
            city: data.hotel.location.city,
            cc: data.hotel.location.cc1,
            lat: parseFloat(data.hotel.location.latitude),
            lng: parseFloat(data.hotel.location.longitude),
        },
        hotel: {
            name: data.hotel.name,
            url: data.hotel.url,
        }
    }
}

function staysFromTrips(tripsResponse) {
    try {
        return JSON
            .parse(tripsResponse)
            .trips
            .filter(trip => trip.cancelled === false)
            .flatMap(trip => 
                trip.timeline
                    .flatMap(t => t.trip_items || [])
                    .filter(t => t.type === "RESERVATION")
                    .filter(t => t.reservation_data.reservation_type === "BOOKING_HOTEL")
                    .map(stayFromReservation)
            )
    } catch (e) {
        // TODO: notify extension that booking parsing has failed
        console.log('ERROR PARSING TRIPS', e)
    }
    return []
}

window.addEventListener('message', function(event) {
    if (event.data && event.data.target === ORIGIN.BOOKING) {
        const stays = staysFromTrips(event.data.data)
        ALL_STAYS = [...ALL_STAYS, ...stays]
        if (event.data.type === 'trip_captured') {
            LOADING_TRIPS = false
            if (CAPTURING) {
                findViewMoreBookings()
            }
        }
    }
})

function injectXMLScript() {
    const injectedScript ="(" +
    function() {
        function isTripsURL(url) {
            return url.startsWith('https://secure.booking.com/trip/timeline')
        }

        const monkeyPatch = () => {
        let oldXHROpen = window.XMLHttpRequest.prototype.open;
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
            });
            return oldXHROpen.apply(this, arguments);
        };
        };
        monkeyPatch();
    } + ")();";

    console.log("Injecting Wander Garden secateur.");
    var script = document.createElement("script");
    script.textContent = injectedScript;
    (document.head || document.documentElement).appendChild(script);
    script.remove();
}

function showLoadingIndicator() {
    if (document.getElementById('wander_garden_loading_indicator')) {
        return
    }

    const indicatorElement = document.createElement('div')
    indicatorElement.id = 'wander_garden_loading_indicator'
    indicatorElement.innerHTML = 'Wander Garden data capture in progress...'
    indicatorElement.style.height = '40px'
    indicatorElement.style.width = '100%'
    indicatorElement.style.backgroundColor = '#4fa177'
    indicatorElement.style.marginTop = '-40px'
    indicatorElement.style.position = 'absolute'
    indicatorElement.style.textAlign = 'center'
    indicatorElement.style.padding = '10px'

    document.body.style.marginTop = '40px'
    document.body.prepend(indicatorElement)
}

function findViewMoreBookings() {
    setTimeout(function() {
        showLoadingIndicator()
        if (LOADING_TRIPS) {
            findViewMoreBookings()
        } else {
            const button = document.querySelector(".mtr-timeline > span > button")
            if (button) {
                button.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true}))

                setTimeout(function() {
                    const loadingButton = document.querySelector(".mtr-timeline > span > button")
                    if (loadingButton) {
                        findViewMoreBookings()
                        console.log('IS LOADING BUTTON')
                    } else {
                        console.log('FETCHING MORE TRIPS')
                        LOADING_TRIPS = true
                    }
                    
                }, 100)

            } else {
                console.log('ENDED!')
                onCaptureFinished()
            }
        }
    }, 200)
}

injectXMLScript()

browser.runtime.sendMessage({
    source: ORIGIN.BOOKING,
    target: ORIGIN.EXTENSION, 
    type: 'init',
})
