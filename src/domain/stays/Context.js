import { createContext, useState, useContext, useEffect } from "react"
import { StayTypeToOrigin, StayType, OriginToStayType } from "./types"
import { IndexedDBStorageAdapter, useSyncedStorage } from "storage"
import moment from "moment"
import { isStayData, isStayType } from "domain/stays"
import StartCaptureModal from "./StartCaptureModal"
import { detectStayType, staysEqual } from "./stays"
import { useCaptured, useClearCaptured, useStartCapture } from "domain/extension"
import { DataOrigin } from "type"
import { getCaptureDiff } from "capture"

export const staysStorage = new IndexedDBStorageAdapter([], 'wander-garden', 'stays')

export async function getAllStays() {
    return staysStorage.get()
}

export async function getStaysType(type) {
    const stays = await staysStorage.get()
    return stays.filter(stay => detectStayType(stay) === type)
}

export const StaysContext = createContext({})

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

    const [stays, setStays] = useSyncedStorage(staysStorage)

    useEffect(() => {
        if (!captured) return 

        const subject = captured.subject
        const stayType = OriginToStayType[subject]
        if (stayType && captured.mode === 'stays') {
            getStaysType(stayType).then((stays) => {
                setCapturedStays({ 
                    stayType,
                    diff: getCaptureDiff(captured.objects, stays, staysEqual),
                    origin: DataOrigin.Captured,
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
        const props = { mode: 'stays' }
        if (captureNewOnly) {
            const stays = await getStaysType(stayType)
            props.lastCapturedObjectID = getLatestStay(stays)?.id
        }
        extensionStartCapture(subject, props)
    }

    async function importCapturedStays(ids) {
        const modifiedIds = capturedStays.diff.modified.map(stay => stay.id)
        const newStays = [
            ...capturedStays.diff.new.filter(stay => ids.includes(stay.id)),
            ...capturedStays.diff.modified.filter(stay => ids.includes(stay.id)),
        ].map(stay => ({ ...stay, origin: capturedStays.origin }))
        const finalStays = [ ...stays.filter(stay => !ids.includes(stay.id)), ...newStays ]
        await setStays(finalStays, modifiedIds)
        await clearCapturedStays()
    }

    function createCustomStays(stays = []) {
        return stays
            .map(stay => ({
                ...stay,
                id: stay.id || createIDForCustomStay(stay),
                type: StayType.Custom,
                origin: DataOrigin.UserInput,
            }))
            .filter(isStayType)
    }

    async function addCustomStays(customStays = []) {
        const staysToAdd = createCustomStays(customStays)
        if (staysToAdd.length !== customStays.length) {
            return console.log('Custom stay data corrupted!')
        }
        const finalStays = [...stays, ...staysToAdd]
        await setStays(finalStays)
    }

    async function replaceCustomStay(stayID, customStays = []) {
        const staysToAdd = createCustomStays(customStays)
        if (staysToAdd.length !== customStays.length) {
            return console.log('Custom stay data corrupted!')
        }
        const finalStays = [...stays.filter(stay => stay.id !== stayID), ...staysToAdd]
        await setStays(finalStays, [stayID])
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

        const localStays = await getStaysType(stayType)
        setCapturedStays({ 
            stayType,
            diff: getCaptureDiff(stays, localStays, staysEqual),
            origin: DataOrigin.File,
        })
    }

    async function replaceAllStays(_newStays = []) {
        const newStays = _newStays.filter(isStayType)
        await setStays(newStays)
    }

    async function clearStaysType(type) {
        if (!type) return undefined
        const nonTypeStays = stays.filter(stay => detectStayType(stay) !== type)
        await setStays(nonTypeStays)
    }

    async function updateStay(updatedStay) {
        if (!isStayType(updatedStay)) return null

        const allStays = [...stays.filter(s => s.id !== updatedStay.id), updatedStay]
        await setStays(allStays, [updatedStay.id])
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
        stays,
        clearStaysType,
        updateStay,
    }

    return (
        <StaysContext.Provider value={value}>
            {children}
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
    return context.stays.filter(stay => detectStayType(stay) === type)
}

export function useAllStays() {
    const context = useContext(StaysContext)
    return context.stays
}

export function useClearStaysType(type) {
    const context = useContext(StaysContext)
    return () => context.clearStaysType(type)
}

export function useReplaceAllStays() {
    const context = useContext(StaysContext)
    return (stays = []) => context.replaceAllStays(stays)
}

export function useUpdateStay() {
    const context = useContext(StaysContext)
    return context.updateStay
}