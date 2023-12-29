import { createContext, useContext, useEffect, useState } from "react"
import { IndexedDBStorageAdapter, useSyncedStorage } from 'storage'
import { OriginToFlightType, FlightTypeToOrigin, flightsEqual } from "./types"
import StartFlightCaptureModal from "./StartCaptureModal"
import { Origin, useCaptured, useClearCaptured, useStartCapture } from "domain/extension"
import { DataOrigin } from "type"
import { getCaptureDiff } from "capture"
import moment from "moment"

export const FlightsContext = createContext({})

const flightsStorage = new IndexedDBStorageAdapter([], 'wander-garden', 'flights')

function getLatestFlight(flights, type) {
    const orderedFlights = [...flights.filter(f => f.flightType === type)]
    orderedFlights.sort((a, b) => moment(b.date).diff(moment(a.date)))
    return orderedFlights[0]
}

export async function getAllFlights() {
    return flightsStorage.get()
}

export function FlightsProvider({ children }) {
    const [selectedCaptureFlightType, setSelectedCaptureFlightType] = useState()
    const [flights, setFlights] = useSyncedStorage(flightsStorage)
    const [capturedFlights, setCapturedFlights] = useState()
    const extensionStartCapture = useStartCapture()
    const captured = useCaptured()
    const clearCaptured = useClearCaptured()

    async function startCapture(flightType, captureNewOnly) {
        const subject = FlightTypeToOrigin[flightType]
        const props = { mode: 'flights' }
        if (captureNewOnly) {
            props.lastCapturedObjectID = getLatestFlight(flights, flightType)?.id
        }
        extensionStartCapture(subject, props)
    }

    useEffect(() => {
        if (!captured) return 
        
        const subject = captured.subject
        const flightType = OriginToFlightType[subject]
        if (flightType && captured.mode === 'flights') {
            setCapturedFlights({ 
                flightType,
                diff: getCaptureDiff(captured.objects, flights, flightsEqual),
                origin: DataOrigin.Captured,
            })
        }
    }, [captured])

    async function clearCapturedFlights() {
        setCapturedFlights(undefined)
        await clearCaptured()
    }

    async function importCapturedFlights(ids) {
        const flightType = capturedFlights.flightType
        const modifiedIds = capturedFlights.diff.modified.map(flight => flight.id)
        const newFlights = [
            ...capturedFlights.diff.new.filter(flight => ids.includes(flight.id)),
            ...capturedFlights.diff.modified.filter(flight => ids.includes(flight.id)),
        ].map(flight => ({ ...flight, flightType, origin: capturedFlights.origin }))
        const finalFlights = [ ...flights.filter(flight => !ids.includes(flight.id)), ...newFlights ]
        await setFlights(finalFlights, modifiedIds)
        await clearCapturedFlights()
    }

    const value = {
        flights,
        setFlights,
        showCaptureStartModal: (flightType) => setSelectedCaptureFlightType(flightType),
        startCapture,

        capturedFlights,
        importCapturedFlights,
        clearCapturedFlights,
    }

    return (
        <FlightsContext.Provider value={value}>
            {children}
            <StartFlightCaptureModal
                flightType={selectedCaptureFlightType}
                onCancel={() => setSelectedCaptureFlightType(undefined)}
            />
        </FlightsContext.Provider>
    )
}

export function useFlights() {
    const context = useContext(FlightsContext)
    return context.flights
}

export function useFlight(id) {
    const context = useContext(FlightsContext)
    return context.flights.find(t => t.id === id)
}

export function useShowCaptureStartModal() {
    const context = useContext(FlightsContext)
    return context.showCaptureStartModal
}

export function useCaptureFlightType() {
    const context = useContext(FlightsContext)
    return function captureFlightType(flightType, captureNewOnly) {
        context.startCapture(flightType, captureNewOnly)
    }
}

export function useReplaceAllFlights() {
    const context = useContext(FlightsContext)
    return (flights = []) => context.setFlights(flights)
}

export function useImportCapturedFlights() {
    const context = useContext(FlightsContext)
    return context.importCapturedFlights
}

export function useClearCapturedFlights() {
    const context = useContext(FlightsContext)
    return context.clearCapturedFlights
}

export function useCapturedFlightsDiff() {
    const context = useContext(FlightsContext)
    return context.capturedFlights?.diff
}
