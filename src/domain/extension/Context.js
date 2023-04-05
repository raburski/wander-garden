import { createContext, useState, useContext, useMemo, useEffect } from "react"
import { useBookingStays } from 'domain/bookingcom'
import { useAirbnbStays } from 'domain/airbnb'
import { useAgodaStays } from "domain/agoda"
import { useRefreshHomes } from "domain/homes"
import { useRefreshTimeline } from "domain/timeline"
import equal from 'fast-deep-equal'

const CURRENT_VERSION = '0.0.4'

export const STATUS = {
    UNKNOWN: 'UNKNOWN',
    CONNECTED: 'CONNECTED',
    FAILED: 'FAILED',
    INCOMPATIBLE: 'INCOMPATIBLE',
    CAPTURING: 'CAPTURING',
}

const ORIGIN = {
    GARDEN: 'wander_garden',
    EXTENSION: 'wander_garden_extension',
    SERVICE: 'wander_garden_service',
    BOOKING: 'booking.com_extension',
    AIRBNB: 'airbnb_extension',
    AGODA: 'agoda_extension',
}

export const ExtensionContext = createContext({})

function sendExtensionMessage(msg) {
    window.postMessage({
        source: ORIGIN.GARDEN,
        ...msg,
    }, '*')
}

function staysEqual(s1, s2) {
    return s1 && s2
        && s1.id === s2.id
        && s1.since === s2.since
        && s1.until === s2.until
        && equal(s1.accomodation, s2.accomodation)
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

    useEffect(() => {
        async function eventListener(event) {
            const message = event.data
            if (!message) { return }
            if (message.source === ORIGIN.SERVICE || message.source === ORIGIN.EXTENSION) {
                if (message.type === 'init') {
                    setVersion(message.version)
                } else if (message.type === 'init_failed') {
                    setFailed(true)
                } else if (message.type === 'capture_finished') {
                    setCapturing(false)
                    if (message.subject === ORIGIN.BOOKING) {
                        setCapturedStays({ 
                            subject: ORIGIN.BOOKING,
                            diff: getStaysCaptureDiff(message.stays, bookingStays)
                        })
                    } else if (message.subject === ORIGIN.AIRBNB) {
                        setCapturedStays({
                            subject: ORIGIN.AIRBNB,
                            diff: getStaysCaptureDiff(message.stays, airbnbStays)
                        })
                    } else if (message.subject === ORIGIN.AGODA) {
                        setCapturedStays({
                            subject: ORIGIN.AGODA,
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

    const startCapture = (subject) => {
        setCapturing(true)
        sendExtensionMessage({ type: 'start_capture', subject, target: ORIGIN.EXTENSION })
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
            case ORIGIN.BOOKING:
                setBookingStays([ ...bookingStays.filter(stay => !ids.includes(stay.id)), ...newStays ]); break
            case ORIGIN.AIRBNB:
                setAirbnbStays([ ...airbnbStays.filter(stay => !ids.includes(stay.id)), ...newStays ]); break
            case ORIGIN.AGODA:
                setAgodaStays([ ...agodaStays.filter(stay => !ids.includes(stay.id)), ...newStays ]); break
        }
        await refresh()
        setCapturedStays(undefined)
    }

    const value = useMemo(() => ({
        isConnected: !!version,
        version,
        failed,
        capturing,
        startCapture,
        capturedStays,
        importCapturedStays,
        clearCapturedStays: () => setCapturedStays(undefined)
    }), [version, failed, capturing, capturedStays])

    return (
        <ExtensionContext.Provider value={value}>
            {children}
        </ExtensionContext.Provider>
    )
}

export function useExtensionStatus() {
    const context = useContext(ExtensionContext)
    if (context.failed) {
        return STATUS.FAILED
    } else if (context.version && context.version !== CURRENT_VERSION) {
        return STATUS.INCOMPATIBLE
    } else if (context.capturing) {
        return STATUS.CAPTURING
    } else if (context.isConnected) {
        return STATUS.CONNECTED
    } else {
        return STATUS.UNKNOWN
    }
}

export function useCapturedStaysDiff() {
    const context = useContext(ExtensionContext)
    return context.capturedStays?.diff
}

export function useCaptureBooking() {
    const context = useContext(ExtensionContext)
    return function captureBooking() {
        context.startCapture(ORIGIN.BOOKING)
    }
}

export function useCaptureAirbnb() {
    const context = useContext(ExtensionContext)
    return function captureAirbnb() {
        context.startCapture(ORIGIN.AIRBNB)
    }
}

export function useCaptureAgoda() {
    const context = useContext(ExtensionContext)
    return function captureAgoda() {
        context.startCapture(ORIGIN.AGODA)
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