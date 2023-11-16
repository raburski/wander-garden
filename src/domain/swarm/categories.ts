import categories from './categories.json'
import type { Checkin, Venue } from "./types"

export const TRANSPORT_TYPE: {[name: string]: string} = {
    PLANE: 'PLANE',
    CAR: 'CAR',
    TRAIN: 'TRAIN',
    SHIP: 'SHIP',
}

const TRANSPORT_CATEGORY_TYPES: {[name: string]: string} = {
    '4bf58dd8d48988d1ed931735': TRANSPORT_TYPE.PLANE,
    '4bf58dd8d48988d1eb931735': TRANSPORT_TYPE.PLANE,
    '4bf58dd8d48988d113951735': TRANSPORT_TYPE.CAR,
    '4bf58dd8d48988d129951735': TRANSPORT_TYPE.TRAIN,
    '4eb1bc533b7b2c5b1d4306cb': TRANSPORT_TYPE.PLANE,
    '4d954b16a243a5684b65b473': TRANSPORT_TYPE.CAR, // Rest Stop
    '63be6904847c3692a84b9c29': TRANSPORT_TYPE.PLANE, // International Airport
}

const TRANSPORT_CATEGORIES = Object.keys(TRANSPORT_CATEGORY_TYPES)

const SHOP_CATEGORIES: string[] = [
    '4bf58dd8d48988d1ff941735', // Miscellaneous Shops
    '5744ccdfe4b0c0459246b4dc', // Shopping Plaza
    '4bf58dd8d48988d1fd941735', // Shopping Mall
    '50be8ee891d4fa8dcc7199a7', // Market
    '4bf58dd8d48988d1f6941735', // Department Store
]

const SIGNIFICANT_CATEGORIES: string[] = [
    '4bf58dd8d48988d12d941735', // Monument / Landmark
    '4bf58dd8d48988d190941735', // History Museum
    '4bf58dd8d48988d181941735', // Museum
    '4bf58dd8d48988d18f941735', // Art Museum
    '52e81612bcbc57f1066b7a3e', // Buddist Temple
    '4bf58dd8d48988d13a941735', // Temple
    '52e81612bcbc57f1066b7a3f', // Hindu Temple
    '4bf58dd8d48988d159941735', // Hiking Trail
    '50aaa49e4b90af0d42d5de11', // Castle
    '4deefb944765f83613cdba6e', // Historic and protected site
    '52e81612bcbc57f1066b7a40', // Monastry
    '4bf58dd8d48988d182941735', // Amusement Park
    '4eb1d80a4b900d56c88a45ff', // Shrine
    '4bf58dd8d48988d136941735', // Opera House
    '4e74f6cabd41c4836eac4c31', // Pier
    '4bf58dd8d48988d1e2941735', // Beach
    '4bf58dd8d48988d132941735', // Church
    '56aa371be4b08b9a8d573532', // Exhibit
    '4bf58dd8d48988d166941735', // Sculpture Garden
    '4bf58dd8d48988d17b941735', // Zoo
    '4bf58dd8d48988d193941735', // Water Park
    '56aa371be4b08b9a8d573560', // Waterfall
    '4bf58dd8d48988d160941735', // Hot Spring
    '4bf58dd8d48988d165941735', // Scenic Lookout
]

export function isSignificant(checkin: Checkin) {
    return checkin.venue ? checkin.venue.categories.some(category => SIGNIFICANT_CATEGORIES.includes(category.id)) : false
}

export function getTransportType(checkin: Checkin) {
    const category = checkin.venue ? checkin.venue.categories.find(category => TRANSPORT_CATEGORIES.includes(category.id)) : null
    return category ? TRANSPORT_CATEGORY_TYPES[category.id] : undefined
}

export function isTransportation(checkin: Checkin): boolean {
    const isTransportationCategory = checkin.venue ? checkin.venue.categories.some(category => TRANSPORT_CATEGORIES.includes(category.id)) : false
    const isTransportationAddress = checkin.venue ? !!checkin.venue.location.address?.toLowerCase().includes('airport') : false
    return isTransportationCategory || isTransportationAddress
}

export function onlyNonTransportation(checkin: Checkin): boolean {
    return !isTransportation(checkin)
}

export function onlyNonGrocery(checkin: Checkin): boolean {
    return checkin.venue ? !checkin.venue.categories.some(category => SHOP_CATEGORIES.includes(category.id)) : true
}

export function checkinHasCategory(checkin: Checkin, categories: string[] | string) {
    const _categories = Array.isArray(categories) ? categories : [categories]
    return checkin.venue.categories.some(cat => _categories.some(catID => cat.id === catID))
}


export function getCategory(catID: string) {
    return categories.find(cat => cat.id === catID)
}

export function categoryEmoji(catID: string) {
    const category = getCategory(catID)
    return category ? category.emoji : null
}

export function venueEmoji(venue: Venue) {
    const emojis = venue.categories.map(cat => categoryEmoji(cat.id)).filter(e => e)
    return emojis.length > 0 ? emojis[0] : '📍'
}