import { createContext, useState, useContext, useEffect } from "react"
import { useRefreshHomes } from "domain/homes"
import { useRefreshTimeline } from "domain/timeline"
import { Status, Origin, StayTypeToOrigin, StayType, OriginToStayType } from "./types"
import { IndexedDBStorageAdapter, StorageSet, useSyncedStorage } from "storage"
import equal from 'fast-deep-equal'
import moment from "moment"
import { isStayData, isStayType } from "domain/stays"
import ImportModal from "./ImportModal"
import CapturingModal from "./CapturingModal"
import StartCaptureModal from "./StartCaptureModal"
import { detectStayType, staysEqual } from "./stays"

const CURRENT_VERSION = '0.0.6'

export const agodaStaysStorage = new IndexedDBStorageAdapter([], 'wander-garden', 'agoda')
export const airbnbStaysStorage = new IndexedDBStorageAdapter([], 'wander-garden', 'airbnb')
export const bookingStaysStorage = new IndexedDBStorageAdapter([], 'wander-garden', 'booking')
export const travalaStaysStorage = new IndexedDBStorageAdapter([], 'wander-garden', 'travala')

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
        default:
            throw new Error('No stays of this type!')
    }
}

export const ExtensionContext = createContext({})

function sendExtensionMessage(msg) {
    window.postMessage({
        source: Origin.Garden,
        ...msg,
    }, '*')
}

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


export function StaysProvider({ children }) {
    const [version, setVersion] = useState()
    const [capturedStays, setCapturedStays] = useState()
    const [failed, setFailed] = useState(false)
    const [capturing, setCapturing] = useState(false)
    const [selectedCaptureStayType, setSelectedCaptureStayType] = useState()

    const bookingStays = useSyncedStorage(bookingStaysStorage)
    const airbnbStays = useSyncedStorage(airbnbStaysStorage)
    const agodaStays = useSyncedStorage(agodaStaysStorage)
    const travalaStays = useSyncedStorage(travalaStaysStorage)

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
            default:
                throw new Error('No stays of this type!')
        }
    }

    const refreshHomes = useRefreshHomes()
    const refreshTimeline = useRefreshTimeline()

    useEffect(() => {
        async function eventListener(event) {
            const message = event.data
            if (!message) { return }
            if (message.source === Origin.Service || message.source === Origin.Extension) {
                if (message.type === 'init') {
                    setVersion(message.version)
                } else if (message.type === 'init_failed') {
                    setFailed(true)
                } else if (message.type === 'capture_finished') {
                    setCapturing(false)
                    const subject = message.subject
                    const stayType = OriginToStayType[subject]
                    const stays = await getStays(stayType)
                    setCapturedStays({ 
                        subject,
                        diff: getStaysCaptureDiff(message.stays, stays)
                    })
                }
            }
        }
        if (!failed) {
            window.addEventListener('message', eventListener)
        }
        return () => window.removeEventListener('message', eventListener)
    }, [failed, refreshHomes, refreshTimeline, setFailed, setCapturing, setVersion])

    async function startCapture(stayType, captureNewOnly) {
        setCapturing(true)
        const subject = StayTypeToOrigin[stayType]
        const stays = await getStays(stayType)
        const lastCapturedStayID = captureNewOnly ? getLatestStay(stays)?.id : undefined
        sendExtensionMessage({ type: 'start_capture', subject, target: Origin.Extension, lastCapturedStayID })
    }

    async function refresh() {
        await refreshHomes()
        await refreshTimeline()
    }

    async function importCapturedStays(ids) {
        const modifiedIds = capturedStays.diff.modified.map(stay => stay.id)
        const newStays = [
            ...capturedStays.diff.new.filter(stay => ids.includes(stay.id)),
            ...capturedStays.diff.modified.filter(stay => ids.includes(stay.id)),
        ]
        const stayType = OriginToStayType[capturedStays.subject]
        const currentStays = await getStays(stayType)
        const finalStays = [ ...currentStays.filter(stay => !ids.includes(stay.id)), ...newStays ]
        await setStays(stayType, finalStays, modifiedIds)
        await refresh()
        setCapturedStays(undefined)
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
            subject: StayTypeToOrigin[stayType],
            diff: getStaysCaptureDiff(stays, localStays)
        })
    }

    const value = {
        isConnected: !!version,
        version,
        failed,
        capturing,
        startCapture,
        startFileImport,
        showCaptureStartModal: (stayType) => setSelectedCaptureStayType(stayType),
        capturedStays,
        importCapturedStays,
        clearCapturedStays: () => setCapturedStays(undefined),
        stays: {
            [StayType.Booking]: bookingStays,
            [StayType.Agoda]: agodaStays,
            [StayType.Airbnb]: airbnbStays,
            [StayType.Travala]: travalaStays,
        }
    }

    return (
        <ExtensionContext.Provider value={value}>
            {children}
            <ImportModal />
            <StartCaptureModal
                stayType={selectedCaptureStayType}
                onCancel={() => setSelectedCaptureStayType(undefined)}
            />
            <CapturingModal isOpen={capturing}/>
        </ExtensionContext.Provider>
    )
}

export function useExtensionStatus() {
    const context = useContext(ExtensionContext)
    if (context.failed) {
        return Status.Failed
    } else if (context.version && context.version !== CURRENT_VERSION) {
        return Status.Incompatible
    } else if (context.capturing) {
        return Status.Capturing
    } else if (context.isConnected) {
        return Status.Connected
    } else {
        return Status.Unknown
    }
}

export function useCapturedStaysDiff() {
    const context = useContext(ExtensionContext)
    return context.capturedStays?.diff
}

export function useStartFileImport() {
    const context = useContext(ExtensionContext)
    return context.startFileImport
}

export function useShowCaptureStartModal() {
    const context = useContext(ExtensionContext)
    return context.showCaptureStartModal
}

export function useCaptureStayType() {
    const context = useContext(ExtensionContext)
    return function captureStayType(stayType, captureNewOnly) {
        context.startCapture(stayType, captureNewOnly)
    }
}

export function useCapture(stayType) {
    const context = useContext(ExtensionContext)
    return function captureBooking() {
        context.startCapture(stayType)
    }
}

export function useClearCapturedStays() {
    const context = useContext(ExtensionContext)
    return context.clearCapturedStays
}

export function useImportCapturedStays() {
    const context = useContext(ExtensionContext)
    return context.importCapturedStays
}

export function useStays(type) {
    const context = useContext(ExtensionContext)
    if (!type) return undefined
    return context.stays[type][0]
}

export function useClearStays(type) {
    const context = useContext(ExtensionContext)
    if (!type) return undefined
    const [_, setStays] = context.stays[type]
    if (!setStays) return undefined

    return async function clearData() {
        await setStays([])
    }
}