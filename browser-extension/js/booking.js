let LOADING_TRIPS = true
let CAPTURING = false
let ALL_STAYS = []
let FINISHED = false

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
        },
        price: data.price ? {
            currency: data.price.currency_code.toUpperCase(),
            amount: data.price.value,
        } : undefined
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

function registerNewStaysCallback(fn) {
    window.addEventListener('message', function(event) {
        if (event.data && event.data.target === ORIGIN.BOOKING) {
            if (event.data.type === 'trip_captured') {
                const stays = staysFromTrips(event.data.data)
                fn(stays)
                LOADING_TRIPS = false
            } else if (event.data.type === 'request_started') {
                LOADING_TRIPS = true
            }
        }
    })
}

function initCapture(captureStay, captureFinished, lastCapturedStayID) {
    if (window.location.href.includes('password')) {
        // on a login page
        return
    }

    function findViewMoreBookings() {
        clickLoadMoreButtonUntilGone(function() {
            if (!FINISHED) {
                captureFinished(ALL_STAYS)
            }
        })
    }

    registerNewStaysCallback(function(stays) {
        const lastCapturedStayIndex = stays.findIndex(stay => stay.id === lastCapturedStayID)
        if (lastCapturedStayIndex >= 0) {
            FINISHED = true
            ALL_STAYS = [...ALL_STAYS, ...stays.slice(0, lastCapturedStayIndex)]
            captureFinished(ALL_STAYS)
        } else {
            ALL_STAYS = [...ALL_STAYS, ...stays]
        }
    })

    setTimeout(findViewMoreBookings, 300)
}

function addLinkWidget(stay, widget) {
    const link = document.querySelector(`a[href^='${stay.url}'] div div`)
    if (link) {
        link.appendChild(widget)
    } else {
        setTimeout(function () {addLinkWidget(stay, widget)}, 500)
    }
}

function initDefault() {
    registerNewStaysCallback(function(stays) {
        stays.forEach(stay => {
            const widget = getDownloadStayWidget(stay)
            widget.style.position = 'absolute'
            widget.style.right = '22px'
            widget.style.marginTop = '-44px'
            addLinkWidget(stay, widget)
        })
    })
}

init(ORIGIN.BOOKING, initCapture, initDefault)