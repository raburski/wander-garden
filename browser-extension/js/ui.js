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

globalThis.showLoadingIndicator = showLoadingIndicator