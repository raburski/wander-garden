import categories from './categories.json'

const TRANSPORT_CATEGORIES = [
    '4bf58dd8d48988d1ed931735', // airport
    '4bf58dd8d48988d1eb931735', // airport terminal
    '4bf58dd8d48988d113951735', // gas station
    '4bf58dd8d48988d129951735', // train station
    '4eb1bc533b7b2c5b1d4306cb', // airport lounge
]

const SHOP_CATEGORIES = [
    '4bf58dd8d48988d1ff941735', // Miscellaneous Shops
    '5744ccdfe4b0c0459246b4dc', // Shopping Plaza
    '4bf58dd8d48988d1fd941735', // Shopping Mall
    '50be8ee891d4fa8dcc7199a7', // Market
    '4bf58dd8d48988d1f6941735', // Department Store
]

export function onlyNonTransportation(checkin) {
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