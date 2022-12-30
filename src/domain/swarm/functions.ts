import moment from 'moment'
import { cleanLocation, isEqualLocationCity, distance } from '../location'
import type { Location, Home } from '../location'
import type { Moment } from "moment"
import type { Checkin } from "./types"

export function ensureDateString(date: String | Moment, format?: string): String {
    if (typeof date === "string") {
        return date as String
    } else {
        return (date as Moment).format(format)
    }
}

export function getCheckinDate(checkin: Checkin): Moment {
    return moment.unix(checkin.createdAt)
}

export function isEqualCountry(leftCheckin: Checkin, rightCheckin: Checkin) {
    return leftCheckin.venue.location.country == rightCheckin.venue.location.country
}

export function isEqualCity(leftCheckin: Checkin, rightCheckin: Checkin) {
    return isEqualLocationCity(leftCheckin.venue.location, rightCheckin.venue.location)
}

export function isEqualState(leftCheckin: Checkin, rightCheckin: Checkin) {
    return cleanLocation(leftCheckin.venue.location.state) == cleanLocation(rightCheckin.venue.location.state)
}

export function hasCity(checkin: Checkin) {
    return !!checkin.venue.location.city
}

export function hasState(checkin: Checkin) {
    return !!checkin.venue.location.state
}


export function getCheckinLocation(checkin: Checkin): Location {
    const location = checkin.venue.location
    return {
        address: location.address,
        city: location.city,
        state: location.state,
        country: location.country,
        cc: location.cc,
        postalCode: location.postalCode,
        lat: location.lat,
        lng: location.lng,
    }
}

export function getDistanceBetweenCheckins(checkin1: Checkin, checkin2: Checkin) {
    const location1 = getCheckinLocation(checkin1)
    const location2 = getCheckinLocation(checkin2)
    return distance(location1.lat, location1.lng, location2.lat, location2.lng)
}
