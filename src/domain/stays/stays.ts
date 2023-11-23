import { createContext, useState, useContext, useMemo, useEffect } from "react"
import { StayTypeToOrigin, StayType, OriginToStayType, PlaceTypeToIcon, StayPlaceType } from "./types"
import equal from 'fast-deep-equal'
import { IndexedDBStorageAdapter, StorageSet, useSyncedStorage } from "storage"
import { Stay } from "./types"
import { getStays, useStays } from "./Context"
import { TbBrandBooking, TbBrandAirbnb, TbDownload, TbCloudUpload, TbTrash, TbRefresh } from 'react-icons/tb'
import { FiExternalLink, FiMapPin } from 'react-icons/fi'
import { MdHotel, MdOutlineUploadFile } from 'react-icons/md'
import { DataOrigin } from "type"
import { LocationAccuracy } from "domain/location"

export function getAllStays() {
    return Promise.all([
        getStays(StayType.Booking),
        getStays(StayType.Airbnb),
        getStays(StayType.Agoda),
        getStays(StayType.Travala),
        getStays(StayType.Custom),
    ]).then(v => v.flat())
}

export function detectStayType(stay: Stay) {
    if (!stay) return undefined 

    const idPart = stay.id.split(':')[0]
    switch (idPart) {
        case "airbnb": return StayType.Airbnb
        case "booking": return StayType.Booking
        case "agoda": return StayType.Agoda
        case "travala": return StayType.Travala
        case "custom": return StayType.Custom
        default: return undefined
    }
}

export function staysEqual(s1: Stay, s2: Stay) {
    return s1 && s2
        && s1.id === s2.id
        && s1.since === s2.since
        && s1.until === s2.until
        && equal(s1.accomodation, s2.accomodation)
        && equal(s1.price, s2.price)
        && equal(s1.location, s2.location)
        // url can vary depedning on auth session
}

export function useAllStays() {
    const booking = useStays(StayType.Booking) as Stay[]
    const airbnb = useStays(StayType.Airbnb) as Stay[]
    const agoda = useStays(StayType.Agoda) as Stay[]
    const travala = useStays(StayType.Travala) as Stay[]
    const custom = useStays(StayType.Custom) as Stay[]
    const allStays = [
        ...booking.map(b => ({ ...b, type: StayType.Booking })),
        ...airbnb.map(b => ({ ...b, type: StayType.Airbnb })),
        ...agoda.map(b => ({ ...b, type: StayType.Agoda })),
        ...travala.map(b => ({ ...b, type: StayType.Travala })),
        ...custom.map(b => ({ ...b, type: StayType.Custom }))
    ]
    return allStays
}

export function getStayTypeIcon(type: StayType) {
    switch (type) {
        case StayType.Agoda:
            return MdHotel
        case StayType.Booking:
            return TbBrandBooking
        case StayType.Airbnb:
            return TbBrandAirbnb
        case StayType.Travala:
            return MdHotel
        default:
            return MdHotel
    }
}

export function getStayIcon(stay: Stay, type: StayType) {
    switch (stay.origin) {
        case DataOrigin.File:
            return MdOutlineUploadFile
        case DataOrigin.UserInput:
            return PlaceTypeToIcon[stay.placeType || StayPlaceType.Accomodation]
        case DataOrigin.Captured:
            return getStayTypeIcon(type)
        default:
            return getStayTypeIcon(type)
    }
}

export const DEFAULT_HOME_LOCATION = {
    country: '',
    cc: '',
    accuracy: LocationAccuracy.None,
    lat: 0,
    lng: 0,
}