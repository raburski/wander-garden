function showLoadingIndicator() {
    if (document.getElementById('wander_garden_loading_indicator')) {
        return
    }

    const indicatorElement = document.createElement('div')
    indicatorElement.id = 'wander_garden_loading_indicator'
    indicatorElement.innerHTML = 'Wander Garden data capture in progress...'
    indicatorElement.style.width = '100%'
    indicatorElement.style.backgroundColor = '#4fa177'
    indicatorElement.style.position = 'fixed'
    indicatorElement.style.top = '0px'
    indicatorElement.style.left = '0px'
    indicatorElement.style.right = '0px'
    indicatorElement.style.textAlign = 'center'
    indicatorElement.style.padding = '11px'
    indicatorElement.style.fontWeight = 'bold'
    indicatorElement.style.fontSize = '16px'
    indicatorElement.style.zIndex = '500'


    document.body.style.marginTop = '44px'
    document.body.prepend(indicatorElement)
}

function getDownloadStayWidget(stay) {
    const widget = document.createElement('button')
    widget.id = `wander_garden_download_widget-${stay.id}`
    widget.innerHTML = 'Download stay for the Garden'
    widget.style.padding = '8px'
    widget.style.paddingLeft = '14px'
    widget.style.paddingRight = '14px'
    widget.style.marginTop = '12px'
    widget.style.textAlign = 'center'

    widget.onclick = stay ? function onWidgetClick(event) {
        event.stopPropagation()
        event.preventDefault()

        const fileName = `${stay.since.slice(0, 10)} - ${stay.accomodation?.name}.json`
        downloadString(JSON.stringify(stay), 'json', fileName)
    } : undefined

    return widget
}


async function scrollIntoViewUntil({ root = document, elementSelector, isFinishedCheck }) {
    const items = [...root.querySelectorAll(elementSelector)]
    const lastItem = items[items.length-1]
    const isFinished = isFinishedCheck(lastItem)
    if (isFinished) return 

    lastItem.scrollIntoView()
    await sleep(300)
    await scrollIntoViewUntil({ root, elementSelector, isFinishedCheck })
}