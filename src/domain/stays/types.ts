import type { Location } from 'domain/location'
import { isLocationType } from "domain/location"
import { isOptionalOfType, isOfType, isMoneyType, Money, isArrayOfType } from "type"
import { MdHotel, MdSailing, MdAdd, MdCheckBoxOutlineBlank, MdCheckBox, MdEdit, MdAddTask } from 'react-icons/md'
import { FaCouch, FaUserFriends, FaCaravan, FaCar, FaShip } from 'react-icons/fa'
import { FiExternalLink } from 'react-icons/fi'
import { TbTent, TbCloudUpload, TbDots } from 'react-icons/tb'

export interface Accomodation {
    name: string
    url?: string
}

export enum StayOrigin {
    File = 'FILE',
    Captured = 'CAPTURED',
    UserInput = 'USER_INPUT',
}

export enum StayPlaceType {
    Extension = 'EXTENSION',
    Accomodation = 'ACCOMODATION',
    Friends = 'FRIENDS',
    Couchsurfing = 'COUCHSURFING',
    Sailboat = 'SAILBOAT',
    Cruiseship = 'CRUISESHIP',
    Campervan = 'CAMPERVAN',
    Camping = 'CAMPING',
    Car = 'CAR',
}

export interface Stay {
    id: string
    url?: string
    since: string
    until: string
    location: Location
    accomodation?: Accomodation
    price?: Money
    totalGuests?: number
    origin?: StayOrigin // DEFAULT: Captured
    placeType?: StayPlaceType // DEFAULT: Accomodation
}

export interface ImportedStay extends Stay {}

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
        && isOptionalOfType(stay.url, 'string')
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
    InitFailed = 'INIT_FAILED',
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
    Custom = 'custom',
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
    [StayType.Custom]: "/logo/backpack.svg",
}

export const StayName = {
    [StayType.Agoda]: "Agoda",
    [StayType.Airbnb]: "Airbnb",
    [StayType.Booking]: "Booking.com",
    [StayType.Travala]: "Travala",
    [StayType.Custom]: "Custom",
}

export const PlaceTypeToIcon = {
    [StayPlaceType.Extension]: MdAddTask,
    [StayPlaceType.Accomodation]: MdHotel,
    [StayPlaceType.Campervan]: FaCaravan,
    [StayPlaceType.Camping]: TbTent,
    [StayPlaceType.Car]: FaCar,
    [StayPlaceType.Couchsurfing]: FaCouch,
    [StayPlaceType.Cruiseship]: FaShip,
    [StayPlaceType.Friends]: FaUserFriends,
    [StayPlaceType.Sailboat]: MdSailing,
}

export const PlaceTypeToTitle = {
    [StayPlaceType.Accomodation]: 'Accomodation',
    [StayPlaceType.Campervan]: 'Campervan',
    [StayPlaceType.Camping]: 'Camping',
    [StayPlaceType.Car]: 'Car',
    [StayPlaceType.Couchsurfing]: 'Couchsurfing',
    [StayPlaceType.Cruiseship]: 'Cruise Ship',
    [StayPlaceType.Friends]: 'Friends',
    [StayPlaceType.Sailboat]: 'Sailboat',
}
