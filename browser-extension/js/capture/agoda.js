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

    return {
        id: `agoda:${data.BookingItem.BookingId}`,
        url: window.location.href,
        since: `${since}T00:00:00+00:00`,
        until: `${until}T00:00:00+00:00`,
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

function initCapture({ captureStay, captureFinished, lastCapturedStayID }) {
    if (window.location.href.includes('signin')) {
        // on a login page
        return
    }

    const params = new URLSearchParams(window.location.search)
    const page = params.get('garden-page') || 'root'
    if (page === 'root') {
        const index = parseInt(sessionStorage.getItem('garden-index')) || 0
        const allCards = [...document.querySelectorAll("div[data-element-name='blp-booking-item-card']")]
        const nextButton = document.querySelector("button[aria-label='Next']")

        if (index > allCards.length - 1) {
            if (!nextButton || nextButton.disabled) {
                sessionStorage.removeItem('garden-index')
                captureFinished()
            } else {
                sessionStorage.setItem('garden-index', 0)
                nextButton.click()
                setTimeout(() => {
                    window.location.reload()
                }, 300)
            }
        } else {
            sessionStorage.setItem('garden-index', index + 1)
            const urlBase = window.location.href.split('#')[0]
            const nextURL = `${urlBase}&garden-page=root`
            const currentURL = `${allCards[index].getAttribute('data-url')}&garden-page=detail&garden-url=${btoa(nextURL)}#littleTest`
            setTimeout(() => window.location = currentURL, 300)
        }
    } else {
        const nextURL = atob(params.get('garden-url'))
        window.addEventListener('message', function(event) {
            const message = event.data
            if (message && message.target === ORIGIN.AGODA) {
                const stay = dataToStay(message.data)
                if (stay?.id === lastCapturedStayID) {
                    sessionStorage.removeItem('garden-index')
                    captureFinished()
                } else {
                    captureStay(stay)
                    setTimeout(() => window.location = nextURL, 300)
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