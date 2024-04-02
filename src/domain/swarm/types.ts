import type { Location } from "../location"
import { isOptionalOfType, isOfType } from "type"
import { isLocationType } from '../location'

export interface Category {
    id: string
    name: string
}

export interface Venue {
    name: string
    location: Location
    categories: Category[]
}

export interface Checkin {
    id: string
    type?: any
    venue: Venue
    createdAt: number
}

export function isVenueType(venue?: Venue) {
    return venue !== undefined
        && isOfType(venue.name, 'string')
        && isOfType(venue.location, isLocationType)
        && isOfType(venue.categories, 'array')
}

export function isCheckinType(checkin?: Checkin) {
    return checkin !== undefined
        && isOfType(checkin.id, 'string')
        && isOfType(checkin.venue, isVenueType)
        && isOfType(checkin.createdAt, 'number')
}

export default {}