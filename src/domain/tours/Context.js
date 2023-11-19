import { createContext, useContext, useEffect, useState } from "react"
import { IndexedDBStorageAdapter, useSyncedStorage } from 'storage'
import { OriginToTourType, TourTypeToOrigin, toursEqual } from "./types"
import StartTourCaptureModal from "./StartCaptureModal"
import { useCaptured, useStartCapture } from "domain/extension"
import { DataOrigin } from "type"
import { getCaptureDiff } from "capture"
import ImportModal from "./ImportModal"
import useRefresh from "domain/refresh"
import moment from "moment"

export const ToursContext = createContext({})

const toursStorage = new IndexedDBStorageAdapter([], 'wander-garden', 'tours')

function getLatestTour(tours) {
    const orderedTours = [...tours]
    orderedTours.sort((a, b) => moment(b.date).diff(moment(a.date)))
    return orderedTours[0]
}

export function ToursProvider({ children }) {
    const [selectedCaptureTourType, setSelectedCaptureTourType] = useState()
    const [tours, setTours] = useSyncedStorage(toursStorage)
    const [capturedTours, setCapturedTours] = useState()
    const extensionStartCapture = useStartCapture()
    const captured = useCaptured()
    const refresh = useRefresh()

    async function startCapture(tourType, captureNewOnly) {
        const subject = TourTypeToOrigin[tourType]
        const props = {}
        if (captureNewOnly) {
            props.lastCapturedObjectID = getLatestTour(tours)?.id
        }
        extensionStartCapture(subject, props)
    }

    useEffect(() => {
        if (!captured) return 

        const subject = captured.subject
        const tourType = OriginToTourType[subject]
        if (tourType) {
            setCapturedTours({ 
                tourType,
                diff: getCaptureDiff(captured.objects, tours, toursEqual),
                origin: DataOrigin.Captured,
            })
        }
    }, [captured])

    async function clearCapturedTours() {
        setCapturedTours(undefined)
    }

    async function importCapturedTours(ids) {
        const tourType = capturedTours.tourType
        const modifiedIds = capturedTours.diff.modified.map(stay => stay.id)
        const newTours = [
            ...capturedTours.diff.new.filter(stay => ids.includes(stay.id)),
            ...capturedTours.diff.modified.filter(stay => ids.includes(stay.id)),
        ].map(tour => ({ ...tour, tourType, origin: capturedTours.origin }))
        const finalTours = [ ...tours.filter(tour => !ids.includes(tour.id)), ...newTours ]
        await setTours(finalTours, modifiedIds)
        await refresh()
        await clearCapturedTours()
    }

    const value = {
        tours,
        showCaptureStartModal: (tourType) => setSelectedCaptureTourType(tourType),
        startCapture,
    }

    return (
        <ToursContext.Provider value={value}>
            {children}
            <StartTourCaptureModal
                tourType={selectedCaptureTourType}
                onCancel={() => setSelectedCaptureTourType(undefined)}
            />
            <ImportModal
                diff={capturedTours?.diff}
                onCancel={clearCapturedTours}
                onImportSelected={importCapturedTours}
            />
        </ToursContext.Provider>
    )
}

export function useTours() {
    const context = useContext(ToursContext)
    return context.tours
}

export function useTour(id) {
    const context = useContext(ToursContext)
    return context.tours.find(t => t.id === id)
}

export function useShowCaptureStartModal() {
    const context = useContext(ToursContext)
    return context.showCaptureStartModal
}

export function useCaptureTourType() {
    const context = useContext(ToursContext)
    return function captureTourType(tourType, captureNewOnly) {
        context.startCapture(tourType, captureNewOnly)
    }
}
