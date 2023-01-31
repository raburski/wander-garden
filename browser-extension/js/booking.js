let LOADING_TRIPS = true
let CAPTURING = false
let ALL_STAYS = []

function stayFromReservation(reservation) {
    const data = reservation.reservation_data
    return {
        id: data.public_id,
        url: ensureFullURL(data.booking_url),
        since: data.reservation_start,
        until: data.reservation_end,
        location: {
            address: data.hotel.location.address.value,
            city: data.hotel.location.city,
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

init(ORIGIN.BOOKING, function(captureStay, captureFinished) {

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
                    captureFinished(ALL_STAYS)
                }
            }
        }, 200)
    }
    
    window.addEventListener('message', function(event) {
        if (event.data && event.data.target === ORIGIN.BOOKING) {
            const stays = staysFromTrips(event.data.data)
            ALL_STAYS = [...ALL_STAYS, ...stays]
            console.log('WINDOW DATA')
            if (event.data.type === 'trip_captured') {
                LOADING_TRIPS = false
                if (CAPTURING) {
                    findViewMoreBookings()
                }
            }
        }
    })

    CAPTURING = true
    if (!LOADING_TRIPS) {
        setTimeout(findViewMoreBookings, 300)
    }
})