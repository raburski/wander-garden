import { createContext, useState, useContext, useMemo, useEffect } from "react"
import { useBookingStays } from 'domain/bookingcom'
import { useAirbnbStays } from 'domain/airbnb'
import { useAgodaStays } from "domain/agoda"
import { useRefreshHomes } from "domain/homes"
import { useRefreshTimeline } from "domain/timeline"
import { Status, Origin, StayTypeToOrigin, StayType } from "./types"
import equal from 'fast-deep-equal'
import moment from "moment"
import { isStayData, isStayType } from "domain/stay"
import ImportModal from "./ImportModal"

const CURRENT_VERSION = '0.0.5'

export const ExtensionContext = createContext({})

function sendExtensionMessage(msg) {
    window.postMessage({
        source: Origin.Garden,
        ...msg,
    }, '*')
}

function staysEqual(s1, s2) {
    return s1 && s2
        && s1.id === s2.id
        && s1.since === s2.since
        && s1.until === s2.until
        && equal(s1.accomodation, s2.accomodation)
        && equal(s1.price, s2.price)
        && equal(s1.location, s2.location)
        // url can vary depedning on auth session
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

function detectStayType(stay) {
    if (!stay) return undefined 

    const idPart = stay.id.split(':')[0]
    switch (idPart) {
        case "airbnb": return StayType.Airbnb
        case "booking": return StayType.Booking
        case "agoda": return StayType.Agoda
        default: return undefined
    }
}

export function ExtensionProvider({ children }) {
    const [version, setVersion] = useState()
    const [capturedStays, setCapturedStays] = useState()
    const [failed, setFailed] = useState(false)
    const [capturing, setCapturing] = useState(false)
    const [bookingStays, setBookingStays] = useBookingStays()
    const [airbnbStays, setAirbnbStays] = useAirbnbStays()
    const [agodaStays, setAgodaStays] = useAgodaStays()

    const refreshHomes = useRefreshHomes()
    const refreshTimeline = useRefreshTimeline()

    const getStays = (ofType) => {
        switch (ofType) {
            case StayType.Agoda:
                return agodaStays
            case StayType.Booking:
                return bookingStays
            case StayType.Airbnb:
                return airbnbStays
            default:
                return undefined
        }
    }

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
                    if (message.subject === Origin.Booking) {
                        setCapturedStays({ 
                            subject: Origin.Booking,
                            diff: getStaysCaptureDiff(message.stays, bookingStays)
                        })
                    } else if (message.subject === Origin.Airbnb) {
                        setCapturedStays({
                            subject: Origin.Airbnb,
                            diff: getStaysCaptureDiff(message.stays, airbnbStays)
                        })
                    } else if (message.subject === Origin.Agoda) {
                        setCapturedStays({
                            subject: Origin.Agoda,
                            diff: getStaysCaptureDiff(message.stays, agodaStays)
                        })
                    }
                }
            }
        }
        if (!failed) {
            window.addEventListener('message', eventListener)
        }
        return () => window.removeEventListener('message', eventListener)
    }, [failed, refreshHomes, refreshTimeline, setFailed, setCapturing, setVersion, setBookingStays, setAirbnbStays])

    const startCapture = (stayType, captureNewOnly) => {
        const subject = StayTypeToOrigin[stayType]
        const lastCapturedStayID = captureNewOnly ? getLatestStay(getStays(stayType))?.id : undefined
        setCapturing(true)
        sendExtensionMessage({ type: 'start_capture', subject, target: Origin.Extension, lastCapturedStayID })
    }

    async function refresh() {
        await refreshHomes()
        await refreshTimeline()
    }

    async function importCapturedStays(ids) {
        const newStays = [
            ...capturedStays.diff.new.filter(stay => ids.includes(stay.id)),
            ...capturedStays.diff.modified.filter(stay => ids.includes(stay.id)),
        ]
        switch (capturedStays.subject) {
            case Origin.Booking:
                setBookingStays([ ...bookingStays.filter(stay => !ids.includes(stay.id)), ...newStays ]); break
            case Origin.Airbnb:
                setAirbnbStays([ ...airbnbStays.filter(stay => !ids.includes(stay.id)), ...newStays ]); break
            case Origin.Agoda:
                setAgodaStays([ ...agodaStays.filter(stay => !ids.includes(stay.id)), ...newStays ]); break
        }
        await refresh()
        setCapturedStays(undefined)
    }

    function startFileImport(stayOrStays) {
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

        const localStays = getStays(stayType)
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
        capturedStays,
        importCapturedStays,
        clearCapturedStays: () => setCapturedStays(undefined)
    }

    return (
        <ExtensionContext.Provider value={value}>
            {children}
            <ImportModal />
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

export function useCaptureBooking() {
    return useCapture(StayType.Booking)
}

export function useCaptureAirbnb() {
    return useCapture(StayType.Airbnb)
}

export function useCaptureAgoda() {
    return useCapture(StayType.Agoda)
}

export function useClearCapturedStays() {
    const context = useContext(ExtensionContext)
    return context.clearCapturedStays
}

export function useImportCapturedStays() {
    const context = useContext(ExtensionContext)
    return context.importCapturedStays
}