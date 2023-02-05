import type { Location } from 'domain/location'
import { isLocationType } from "domain/location"
import { isOptionalOfType, isOfType } from "type"

export interface Accomodation {
    name: string
    url?: string
}

export interface Stay {
    id: string
    url: string
    since: string
    until: string
    location: Location
    accomodation?: Accomodation
}

export function isAccomodationType(accomodation?: Accomodation): boolean {
    return accomodation !== undefined
        && isOfType(accomodation.name, 'string')
        && isOptionalOfType(accomodation.url, 'string')
}

export function isStayType(stay?: Stay): boolean {
    return stay !== undefined
        && isOfType(stay.id, 'string')
        && isOfType(stay.url, 'string')
        && isOfType(stay.since, 'string')
        && isOfType(stay.until, 'string')
        && isOfType(stay.location, isLocationType)
        && isOptionalOfType(stay.accomodation, isAccomodationType)
}