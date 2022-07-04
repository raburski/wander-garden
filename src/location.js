export function cleanState(state) {
    if (state === 'Lower Silesia' || state == 'Dolnoslezské') {
        return 'Dolnośląskie'
    }
    return state.replace('Województwo ', '').replace(' Županija', '')
}

export function cleanLocation(location = "") {
    return cleanState(location)
        .toLowerCase()
        .replace(' city', '')
        .normalize('NFD')
        .replace(/([\u0300-\u036f])/g, '')
        .replace('ł', 'l')
        .replace(/(wiu)$/g, 'w')
}

export function isEqualCountry(leftCheckin, rightCheckin) {
    return leftCheckin.venue.location.country == rightCheckin.venue.location.country
}

export function isEqualCity(leftCheckin, rightCheckin) {
    return cleanLocation(leftCheckin.venue.location.city) == cleanLocation(rightCheckin.venue.location.city)
}

export function isEqualState(leftCheckin, rightCheckin) {
    return cleanLocation(leftCheckin.venue.location.state) == cleanLocation(rightCheckin.venue.location.state)
}

export function hasCity(checkin) {
    return !!checkin.venue.location.city
}

export function hasState(checkin) {
    return !!checkin.venue.location.state
}