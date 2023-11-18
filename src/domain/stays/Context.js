import { createContext, useState, useContext, useEffect } from "react"
import { StayTypeToOrigin, StayType, OriginToStayType, StayOrigin, ALL_STAY_TYPES } from "./types"
import { IndexedDBStorageAdapter, useSyncedStorage } from "storage"
import moment from "moment"
import { isStayData, isStayType } from "domain/stays"
import ImportModal from "./ImportModal"
import StartCaptureModal from "./StartCaptureModal"
import { detectStayType, staysEqual } from "./stays"
import useRefresh from "domain/refresh"
import { useCaptured, useClearCaptured, useStartCapture } from "domain/extension"

export const CURRENT_VERSION = '0.1.0'

export const agodaStaysStorage = new IndexedDBStorageAdapter([], 'wander-garden', 'agoda')
export const airbnbStaysStorage = new IndexedDBStorageAdapter([], 'wander-garden', 'airbnb')
export const bookingStaysStorage = new IndexedDBStorageAdapter([], 'wander-garden', 'booking')
export const travalaStaysStorage = new IndexedDBStorageAdapter([], 'wander-garden', 'travala')
export const customStaysStorage = new IndexedDBStorageAdapter([], 'wander-garden', 'custom')

export function getStays(type) {
    switch (type) {
        case StayType.Agoda:
            return agodaStaysStorage.get()
        case StayType.Booking:
            return bookingStaysStorage.get()
        case StayType.Airbnb:
            return airbnbStaysStorage.get()
        case StayType.Travala:
            return travalaStaysStorage.get()
        case StayType.Custom:
            return customStaysStorage.get()
        default:
            throw new Error('No stays of this type!')
    }
}

export const StaysContext = createContext({})

function getStaysCaptureDiff(capturedStays, localStays) {
    const newStays = capturedStays.filter(stay => localStays.findIndex(localStay => localStay.id === stay.id) === -1)
    const modifiedStays = capturedStays.filter(stay => {
        const localStay = localStays.find(lStay => lStay.id === stay.id)
        if (!localStay) { return false }
        if (staysEqual(stay, localStay)) { return false }
        return true
    })
    const unchangedStays = capturedStays.filter(stay => {
        if (newStays.findIndex(ns => ns.id === stay.id) >= 0) { return false }
        if (modifiedStays.findIndex(ms => ms.id === stay.id) >= 0) { return false }
        return true
    })
    return {
        new: newStays,
        modified: modifiedStays,
        unchanged: unchangedStays,
    }
}

function getLatestStay(stays) {
    const orderedStays = [...stays]
    orderedStays.sort((a, b) => moment(b.since).diff(moment(a.since)))
    return orderedStays[0]
}

function createIDForCustomStay(stay) {
    return `custom:${stay.location.cc}:${stay.since}-${stay.until}`
}


export function StaysProvider({ children }) {
    const [selectedCaptureStayType, setSelectedCaptureStayType] = useState()
    const [capturedStays, setCapturedStays] = useState()

    // extension methods
    const extensionStartCapture = useStartCapture()
    const captured = useCaptured()
    const clearCaptured = useClearCaptured()

    const bookingStays = useSyncedStorage(bookingStaysStorage)
    const airbnbStays = useSyncedStorage(airbnbStaysStorage)
    const agodaStays = useSyncedStorage(agodaStaysStorage)
    const travalaStays = useSyncedStorage(travalaStaysStorage)
    const customStays = useSyncedStorage(customStaysStorage)

    function setStays(type, stays, keysToReplace = []) {
        switch (type) {
            case StayType.Agoda:
                return agodaStays[1](stays, keysToReplace)
            case StayType.Booking:
                return bookingStays[1](stays, keysToReplace)
            case StayType.Airbnb:
                return airbnbStays[1](stays, keysToReplace)
            case StayType.Travala:
                return travalaStays[1](stays, keysToReplace)
            case StayType.Custom:
                return customStays[1](stays, keysToReplace)
            default:
                throw new Error('No stays of this type!')
        }
    }

    const refresh = useRefresh()

    useEffect(() => {
        if (!captured) return 

        const subject = captured.subject
        const stayType = OriginToStayType[subject]
        if (stayType) {
            getStays(stayType).then((stays) => {
                setCapturedStays({ 
                    stayType,
                    diff: getStaysCaptureDiff(captured.stays, stays),
                    origin: StayOrigin.Captured,
                })
            })
        }
    }, [captured])

    async function clearCapturedStays() {
        setCapturedStays(undefined)
        await clearCaptured()
    }

    async function startCapture(stayType, captureNewOnly) {
        const subject = StayTypeToOrigin[stayType]
        const props = {}
        if (captureNewOnly) {
            const stays = await getStays(stayType)
            props.lastCapturedStayID = getLatestStay(stays)?.id
        }
        extensionStartCapture(subject, props)
    }

    async function importCapturedStays(ids) {
        const modifiedIds = capturedStays.diff.modified.map(stay => stay.id)
        const newStays = [
            ...capturedStays.diff.new.filter(stay => ids.includes(stay.id)),
            ...capturedStays.diff.modified.filter(stay => ids.includes(stay.id)),
        ].map(stay => ({ ...stay, origin: capturedStays.origin }))
        const stayType = capturedStays.stayType
        const currentStays = await getStays(stayType)
        const finalStays = [ ...currentStays.filter(stay => !ids.includes(stay.id)), ...newStays ]
        await setStays(stayType, finalStays, modifiedIds)
        await refresh()
        await clearCapturedStays()
    }

    function createCustomStays(stays = []) {
        return stays
            .map(stay => ({
                ...stay,
                id: stay.id || createIDForCustomStay(stay),
                origin: StayOrigin.UserInput,
            }))
            .filter(isStayType)
    }

    async function addCustomStays(stays = []) {
        const staysToAdd = createCustomStays(stays)
        if (staysToAdd.length !== stays.length) {
            return console.log('Custom stay data corrupted!')
        }
        const currentStays = customStays[0]
        const finalStays = [...currentStays, ...staysToAdd]
        await setStays(StayType.Custom, finalStays)
        await refresh()
    }

    async function replaceCustomStay(stayID, stays = []) {
        const staysToAdd = createCustomStays(stays)
        if (staysToAdd.length !== stays.length) {
            return console.log('Custom stay data corrupted!')
        }
        const currentStays = customStays[0]
        const finalStays = [...currentStays.filter(stay => stay.id !== stayID), ...staysToAdd]
        await setStays(StayType.Custom, finalStays)
        await refresh()
    }

    async function startFileImport(stayOrStays) {
        if (!stayOrStays) return

        const stays = Array.isArray(stayOrStays) ? stayOrStays : [stayOrStays]
        if (stays.length === 0) return

        const stayTypes = stays.map(detectStayType)
        const stayType = stayTypes[0]
        const allStayTypesEqual = stayTypes.reduce((a, t) => a && t === stayType, true)
        if (!allStayTypesEqual) {
            throw Error('All stays should have the same origin.')
        }

        if (!isStayData(stays)) {
            throw Error('All stays should have valid type.')
        }

        const localStays = await getStays(stayType)
        setCapturedStays({ 
            stayType,
            diff: getStaysCaptureDiff(stays, localStays),
            origin: StayOrigin.File,
        })
    }

    async function replaceAllStays(_newStays = []) {
        const newStays = _newStays.filter(isStayType)
        for(let type of ALL_STAY_TYPES) {
            const newStaysOfType = newStays.filter(stay => detectStayType(stay) === type)
            await setStays(type, newStaysOfType)
        }
        await refresh()
    }

    const value = {
        capturedStays,
        startCapture,
        startFileImport,
        showCaptureStartModal: (stayType) => setSelectedCaptureStayType(stayType),
        importCapturedStays,
        clearCapturedStays,
        addCustomStays,
        replaceCustomStay,
        replaceAllStays,
        stays: {
            [StayType.Booking]: bookingStays,
            [StayType.Agoda]: agodaStays,
            [StayType.Airbnb]: airbnbStays,
            [StayType.Travala]: travalaStays,
            [StayType.Custom]: customStays,
        }
    }

    return (
        <StaysContext.Provider value={value}>
            {children}
            <ImportModal />
            <StartCaptureModal
                stayType={selectedCaptureStayType}
                onCancel={() => setSelectedCaptureStayType(undefined)}
            />
        </StaysContext.Provider>
    )
}

export function useCapturedStaysDiff() {
    const context = useContext(StaysContext)
    return context.capturedStays?.diff
}

export function useStartFileImport() {
    const context = useContext(StaysContext)
    return context.startFileImport
}

export function useShowCaptureStartModal() {
    const context = useContext(StaysContext)
    return context.showCaptureStartModal
}

export function useCaptureStayType() {
    const context = useContext(StaysContext)
    return function captureStayType(stayType, captureNewOnly) {
        context.startCapture(stayType, captureNewOnly)
    }
}

export function useClearCapturedStays() {
    const context = useContext(StaysContext)
    return context.clearCapturedStays
}

export function useImportCapturedStays() {
    const context = useContext(StaysContext)
    return context.importCapturedStays
}

export function useAddCustomStays() {
    const context = useContext(StaysContext)
    return context.addCustomStays
}

export function useReplaceCustomStay() {
    const context = useContext(StaysContext)
    return context.replaceCustomStay
}

export function useStays(type) {
    const context = useContext(StaysContext)
    if (!type) return undefined
    return context.stays[type][0]
}

export function useClearStays(type) {
    const context = useContext(StaysContext)
    if (!type) return undefined
    const [_, setStays] = context.stays[type]
    if (!setStays) return undefined

    return async function clearData() {
        await setStays([])
    }
}

export function useReplaceAllStays() {
    const context = useContext(StaysContext)
    return context.replaceAllStays
}