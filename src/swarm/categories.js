import categories from './categories.json'

export const TRANSPORT_TYPE = {
    PLANE: 'PLANE',
    CAR: 'CAR',
    TRAIN: 'TRAIN',
    SHIP: 'SHIP',
}

const TRANSPORT_CATEGORY_TYPES = {
    '4bf58dd8d48988d1ed931735': TRANSPORT_TYPE.PLANE,
    '4bf58dd8d48988d1eb931735': TRANSPORT_TYPE.PLANE,
    '4bf58dd8d48988d113951735': TRANSPORT_TYPE.CAR,
    '4bf58dd8d48988d129951735': TRANSPORT_TYPE.TRAIN,
    '4eb1bc533b7b2c5b1d4306cb': TRANSPORT_TYPE.PLANE,
}

const TRANSPORT_CATEGORIES = Object.keys(TRANSPORT_CATEGORY_TYPES)

const SHOP_CATEGORIES = [
    '4bf58dd8d48988d1ff941735', // Miscellaneous Shops
    '5744ccdfe4b0c0459246b4dc', // Shopping Plaza
    '4bf58dd8d48988d1fd941735', // Shopping Mall
    '50be8ee891d4fa8dcc7199a7', // Market
    '4bf58dd8d48988d1f6941735', // Department Store
]

export function getTransportType(checkin) {
    const category = checkin.venue ? checkin.venue.categories.find(category => TRANSPORT_CATEGORIES.includes(category.id)) : null
    return category ? TRANSPORT_CATEGORY_TYPES[category.id] : null
}

export function isTransportation(checkin) {
    return checkin.venue ? checkin.venue.categories.some(category => TRANSPORT_CATEGORIES.includes(category.id)) : false
}

export function onlyNonTransportation(checkin) {
    return !isTransportation(checkin)
    return checkin.venue ? !checkin.venue.categories.some(category => TRANSPORT_CATEGORIES.includes(category.id)) : true
}

export function onlyNonGrocery(checkin) {
    return checkin.venue ? !checkin.venue.categories.some(category => SHOP_CATEGORIES.includes(category.id)) : true
}


export function getCategory(catID) {
    return categories.find(cat => cat.id === catID)
}

export function categoryEmoji(catID) {
    const category = getCategory(catID)
    return category ? category.emoji : null
}

export function venueEmoji(venue) {
    const emojis = venue.categories.map(cat => categoryEmoji(cat.id)).filter(e => e)
    return emojis.length > 0 ? emojis[0] : '📍'
}