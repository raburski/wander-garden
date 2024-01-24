import { createContext, useState, useContext, useMemo, useEffect } from "react"
import { StayTypeToOrigin, StayType, OriginToStayType, PlaceTypeToIcon, StayPlaceType } from "./types"
import equal from 'fast-deep-equal'
import { IndexedDBStorageAdapter, StorageSet, useSyncedStorage } from "storage"
import { Stay } from "./types"
import { TbBrandBooking, TbBrandAirbnb, TbDownload, TbCloudUpload, TbTrash, TbRefresh } from 'react-icons/tb'
import { FiExternalLink, FiMapPin } from 'react-icons/fi'
import { MdHotel, MdOutlineUploadFile, MdRemoveCircleOutline } from 'react-icons/md'
import { DataOrigin } from "type"
import { LocationAccuracy } from "domain/location"

export function detectStayType(stay: Stay) {
    if (!stay) return undefined
    if (stay.type) return stay.type

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
    if (stay.disabled) {
        return MdRemoveCircleOutline
    }
    switch (stay.origin) {
        case DataOrigin.File:
            return MdOutlineUploadFile
        case DataOrigin.UserInput:
            return PlaceTypeToIcon[stay.placeType || StayPlaceType.Accomodation]
        case DataOrigin.Captured:
            return getStayTypeIcon(type)
        case DataOrigin.Generated:
            return PlaceTypeToIcon[stay.placeType || StayPlaceType.Accomodation]
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