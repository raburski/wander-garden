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
        }
    }
}

init(ORIGIN.AGODA, function(captureStay, captureFinished) {
    showLoadingIndicator()
    window.addEventListener("load", function() {

        const params = new URLSearchParams(window.location.search)
        const page = params.get('garden-page') || 'root'
        if (page === 'root') {
            const index = parseInt(localStorage.getItem('garden-index')) || 0
            const allCards = [...document.querySelectorAll("div[data-element-name='blp-booking-item-card']")]
            if (index > allCards.length - 1) {
                localStorage.removeItem('garden-index')
                captureFinished()
            } else {
                localStorage.setItem('garden-index', index + 1)
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
                    captureStay(dataToStay(message.data))
                    setTimeout(() => window.location = nextURL, 300)
                }
            })
            injectExtractScript()
        }
    })
})