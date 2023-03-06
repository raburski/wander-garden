let LOADING_TRIPS = true
let CAPTURING = false
let ALL_STAYS = []

function stayFromReservation(reservation) {
    const data = reservation.reservation_data
    return {
        id: `booking:${data.public_id}`,
        url: ensureFullURL(data.booking_url),
        since: data.reservation_start,
        until: data.reservation_end,
        location: {
            address: data.hotel.location.address.value,
            city: data.hotel.location.city,
            country: countryCodeToName[data.hotel.location.cc1.toUpperCase()],
            cc: data.hotel.location.cc1,
            lat: parseFloat(data.hotel.location.latitude),
            lng: parseFloat(data.hotel.location.longitude),
        },
        accomodation: {
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

function injectXMLScript() {
    var s = document.createElement('script');
    s.src = chrome.runtime.getURL('injectXML.js');
    s.onload = function() {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
}

injectXMLScript()

function clickLoadMoreButtonUntilGone(callback) {
    const button = document.querySelector(".mtr-timeline > span > button")
    const text = button ? button.innerText : ''
    if (button && text.length > 6) { // View more bookings
        button.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true}))
        setTimeout(function() { clickLoadMoreButtonUntilGone(callback) }, 300)
    } else if (button) { // Loading indicator
        setTimeout(function() { clickLoadMoreButtonUntilGone(callback) }, 300)
    } else { // button gone
        if (LOADING_TRIPS) {
            setTimeout(function() { clickLoadMoreButtonUntilGone(callback) }, 300)
        } else {
            callback()
        }
    }
}

init(ORIGIN.BOOKING, function(captureStay, captureFinished) {

    function findViewMoreBookings() {
        clickLoadMoreButtonUntilGone(function() {
            captureFinished(ALL_STAYS)
        })
    }
    
    window.addEventListener('message', function(event) {
        if (event.data && event.data.target === ORIGIN.BOOKING) {
            if (event.data.type === 'trip_captured') {
                const stays = staysFromTrips(event.data.data)
                ALL_STAYS = [...ALL_STAYS, ...stays]
                LOADING_TRIPS = false
            } else if (event.data.type === 'request_started') {
                LOADING_TRIPS = true
            }
        }
    })

    setTimeout(findViewMoreBookings, 300)
})