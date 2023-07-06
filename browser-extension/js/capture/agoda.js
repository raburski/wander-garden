function injectExtractScript() {
    var s = document.createElement('script');
    s.src = chrome.runtime.getURL('injectWindowExtract.js');
    s.onload = function() {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
}

function dataToStay(data) {
    const since = data.BookingItem.Dates.CheckInDateNonCulture
    const until = data.BookingItem.Dates.CheckOutDateNonCulture
    const cc = getCountryCode(data.BookingItem.Property.Address.Country)
    const Costs = data.BookingItem.PaymentDetails.NonCancelledPaymentDetails.Costs
    const currency = Costs[0].Amount.Currency
    const allTheSameCurrency = Costs.length > 0 ? Costs.every(c => c.Amount.Currency === currency) : false
    const amount = Costs.reduce((a, c) => a + c.Amount.AmountAsDouble, 0)
    const totalGuests = data.BookingItem.Guests.SecondaryGuests.length + 1

    return {
        id: `agoda:${data.BookingItem.BookingId}`,
        url: window.location.href,
        since: `${since}T00:00:00+00:00`,
        until: `${until}T00:00:00+00:00`,
        totalGuests,
        location: {
            address: [data.BookingItem.Property.Address.Address1, data.BookingItem.Property.Address.Address2].filter(Boolean).join(', '),
            city: data.BookingItem.Property.Address.City,
            country: countryCodeToName[cc.toUpperCase()],
            cc: cc.toLowerCase(),
            lat: data.BookingItem.Property.GeoInfo.Latitude,
            lng: data.BookingItem.Property.GeoInfo.Longitude,
        },
        accomodation: {
            name: data.BookingItem.Property.PropertyName,
            url: ensureFullURL(data.BookingItem.Property.PropertyUrl),
        },
        price: allTheSameCurrency ? {
            amount,
            currency,
        } : undefined
    }
}

async function openCompletedBookingsPage() {
    const completedTabButton = document.getElementById('mmb-booking-phase-tabs-tab-2')
    if (completedTabButton.getAttribute('aria-selected') === 'false') {
        completedTabButton.click()
    }
    
    const pageNumber = parseInt(sessionStorage.getItem('garden-page')) || 1
    if (pageNumber > 1) {
        await sleep(300)
        await waitForElement(".paginator")
        const pageButton = document.querySelector(`.paginator span[data-name='${pageNumber}']`).closest('button')
        pageButton.click()
        await sleep(300)
    }
}

async function openBookingsCards(captureFinished) {
    await waitForElement("div[data-element-name='mmb-booking-card']")
    const cardIndex = parseInt(sessionStorage.getItem('garden-index')) || 0
    const allCards = [...document.querySelectorAll("div[data-element-name='mmb-booking-card']")]
    const nextButton = document.querySelector("button[data-element-name='next-button']")

    if (cardIndex > allCards.length - 1) {
        if (nextButton.getAttribute('aria-disabled') === 'true') {
            sessionStorage.removeItem('garden-index')
            sessionStorage.removeItem('garden-page')
            captureFinished()
        } else {
            const pageNumber = parseInt(sessionStorage.getItem('garden-page')) || 1
            sessionStorage.removeItem('garden-index')
            sessionStorage.setItem('garden-page', pageNumber + 1)
            await sleep(300)
            await openBookingsCards(captureFinished)
        }
    } else {
        sessionStorage.setItem('garden-index', cardIndex + 1)
        const manageButton = allCards[cardIndex].querySelector("[data-element-name='blp-booking-item-button-edit']")
        manageButton.click()
    }
}

async function captureBookingsPage(captureFinished) {
    await openCompletedBookingsPage()
    await openBookingsCards(captureFinished)
}

function initCapture({ captureStay, captureFinished, lastCapturedStayID }) {
    if (window.location.href.includes('signin')) {
        // on a login page
        return
    }

    const params = new URLSearchParams(window.location.search)
    if (window.location.href.includes('account/bookings')) {
        captureBookingsPage(captureFinished)

    } else if (window.location.href.includes('editbooking')) {
        window.addEventListener('message', function(event) {
            const message = event.data
            if (message && message.target === ORIGIN.AGODA) {
                const stay = dataToStay(message.data)
                if (stay?.id === lastCapturedStayID) {
                    sessionStorage.removeItem('garden-index')
                    captureFinished()
                } else {
                    captureStay(stay)
                    history.back()
                }
            }
        })
        injectExtractScript()
    }
}

function initDefault() {
    if (window.location.href.includes('account/editbooking.html?bookingId=')) {
        window.addEventListener('message', function(event) {
            const message = event.data
            if (message && message.target === ORIGIN.AGODA) {
                try {
                    const stay = dataToStay(message.data)
                    const widget = getDownloadStayWidget(stay)
                    document.getElementsByClassName('mmb-left-pane')[0].appendChild(widget)
                } catch(e) {
                    console.log('failed', e)
                }
            }
        })
        injectExtractScript()
    }
}

init(ORIGIN.AGODA, initCapture, initDefault)