import { createContext, useContext, useState } from "react"
import { IndexedDBStorageAdapter, useSyncedStorage } from 'storage'
import { TourTypeToOrigin } from "./types"
import StartTourCaptureModal from "./StartCaptureModal"
import { useStartCapture } from "domain/extension"

export const ToursContext = createContext({})

const toursStorage = new IndexedDBStorageAdapter([], 'wander-garden', 'tours')

export function ToursProvider({ children }) {
    const [selectedCaptureTourType, setSelectedCaptureTourType] = useState()
    const [tours, setTours] = useSyncedStorage(toursStorage)
    const [capturedTours, setCapturedTours] = useState()
    const extensionStartCapture = useStartCapture()

    async function startCapture(tourType, captureNewOnly) {
        const subject = TourTypeToOrigin[tourType]
        const props = {}
        if (captureNewOnly) {
            // const stays = await getStays(stayType)
            // props.lastCapturedStayID = getLatestStay(stays)?.id
        }
        extensionStartCapture(subject, props)
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
