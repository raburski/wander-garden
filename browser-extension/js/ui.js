function showLoadingIndicator() {
    if (document.getElementById('wander_garden_loading_indicator')) {
        return
    }

    const indicatorElement = document.createElement('div')
    indicatorElement.id = 'wander_garden_loading_indicator'
    indicatorElement.innerHTML = 'Wander Garden data capture in progress...'
    indicatorElement.style.height = '44px'
    indicatorElement.style.width = '100%'
    indicatorElement.style.backgroundColor = '#4fa177'
    indicatorElement.style.marginTop = '-44px'
    indicatorElement.style.position = 'absolute'
    indicatorElement.style.textAlign = 'center'
    indicatorElement.style.padding = '11px'
    indicatorElement.style.fontWeight = 'bold'
    indicatorElement.style.fontSize = '16px'


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