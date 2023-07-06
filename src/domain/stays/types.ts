import type { Location } from 'domain/location'
import { isLocationType } from "domain/location"
import { isOptionalOfType, isOfType, isMoneyType, Money, isArrayOfType } from "type"

export interface Accomodation {
    name: string
    url?: string
}

export enum StayOrigin {
    File = 'file',
    Captured = 'captured'
}

export interface Stay {
    id: string
    url: string
    since: string
    until: string
    location: Location
    accomodation?: Accomodation
    price?: Money
    totalGuests?: number
    origin?: StayOrigin
}

export interface StayCaptureDiff {
    new: Stay[]
    modified: Stay[]
    unchanged: Stay[]
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
        && isOptionalOfType(stay.price, isMoneyType)
        && isOptionalOfType(stay.totalGuests, 'number')
}

export function isStayData(data: any[]) {
    return isArrayOfType(data, isStayType)
}

export enum Status {
    Unknown = 'UNKNOWN',
    Connected = 'CONNECTED',
    Failed = 'FAILED',
    Incompatible = 'INCOMPATIBLE',
    Capturing = 'CAPTURING',
}

export enum Origin {
    Garden = 'wander_garden',
    Extension = 'wander_garden_extension',
    Service = 'wander_garden_service',
    Booking = 'booking.com_extension',
    Airbnb = 'airbnb_extension',
    Agoda = 'agoda_extension',
    Travala = 'travala_extension',
}

export enum StayType {
    Booking = 'booking',
    Airbnb = 'airbnb',
    Agoda = 'agoda',
    Travala = 'travala',
}

export const OriginToStayType = {
    [Origin.Agoda]: StayType.Agoda,
    [Origin.Airbnb]: StayType.Airbnb,
    [Origin.Booking]: StayType.Booking,
    [Origin.Travala]: StayType.Travala,
}

export const StayTypeToOrigin = {
    [StayType.Agoda]: Origin.Agoda,
    [StayType.Airbnb]: Origin.Airbnb,
    [StayType.Booking]: Origin.Booking,
    [StayType.Travala]: Origin.Travala,
}

export const StayLogoURL = {
    [StayType.Agoda]: "/logo/agoda.svg",
    [StayType.Airbnb]: "/logo/airbnb.svg",
    [StayType.Booking]: "/logo/bookingcom.svg",
    [StayType.Travala]: "/logo/travala.svg",
}

export const StayName = {
    [StayType.Agoda]: "Agoda",
    [StayType.Airbnb]: "Airbnb",
    [StayType.Booking]: "Booking.com",
    [StayType.Travala]: "Travala",
}