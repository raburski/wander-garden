import { createContext, useState, useContext, useMemo, useEffect } from "react"
import { Status, Origin, StayTypeToOrigin, StayType, OriginToStayType } from "./types"
import equal from 'fast-deep-equal'
import { IndexedDBStorageAdapter, StorageSet, useSyncedStorage } from "storage"
import { Stay } from "./types"
import { getStays, useStays } from "./Context"

export function getAllStays() {
    return Promise.all([
        getStays(StayType.Booking),
        getStays(StayType.Airbnb),
        getStays(StayType.Agoda),
        getStays(StayType.Travala),
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
    const booking = useStays(StayType.Booking)
    const airbnb = useStays(StayType.Airbnb)
    const agoda = useStays(StayType.Agoda)
    const travala = useStays(StayType.Travala)
    const allStays = [...booking, ...airbnb, ...agoda, ...travala]
    return allStays
}
