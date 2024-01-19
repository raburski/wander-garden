import { useReplaceAllFlights } from "./flights"
import { useReplaceAllNotes } from "./notes"
import { useRefreshStats } from "./stats"
import { isStayData, useReplaceAllStays } from "./stays"
import { isSwarmData, useClearData, useReplaceAllCheckins } from "./swarm"
import { useReplaceAllTitles } from "./titles"
import { useReplaceAllTours } from "./tours"
import { useRefreshTrips } from "./trips"
import toast from "react-hot-toast"

export default function useRefresh() {
    const refreshTrips = useRefreshTrips()
    const refreshStats = useRefreshStats()
    async function refresh() {
        await refreshTrips()
        await refreshStats()
    }

    return async function toastedRefresh(showToast = true) {
        if (showToast) {
            return toast.promise(refresh(), {
                loading: 'Refreshing...',
                success: 'All up to date!',
                error: 'Something went wrong...',
            })
        } else {
            return refresh()
        }
    }
}

export function useClearAll() {
    const clearSwarmData = useClearData()
    const replaceAllStays = useReplaceAllStays()
    const replaceAllTitles = useReplaceAllTitles()
    const replaceAllTours = useReplaceAllTours()
    const replaceAllNotes = useReplaceAllNotes()
    const replaceAllCheckins = useReplaceAllCheckins()
    const replaceAllFlights = useReplaceAllFlights()
    const refresh = useRefresh()
    return async function clearAll() {
        await clearSwarmData()
        await replaceAllTitles({})
        await replaceAllStays([])
        await replaceAllTours([])
        await replaceAllNotes([])
        await replaceAllCheckins([])
        await replaceAllFlights([])
        await refresh(false)
    }
}

export function useReplaceAll() {
    const clearAll = useClearAll()
    const replaceAllStays = useReplaceAllStays()
    const replaceAllTitles = useReplaceAllTitles()
    const replaceAllTours = useReplaceAllTours()
    const replaceAllNotes = useReplaceAllNotes()
    const replaceAllCheckins = useReplaceAllCheckins()
    const replaceAllFlights = useReplaceAllFlights()
    const refresh = useRefresh()

    return async function replaceAll(allData) {
        if (isSwarmData(allData.checkins) && isStayData(allData.stays)) {
            const toastId = toast.loading('Loading data...')
            await clearAll()
            await replaceAllTours(allData.tours)
            await replaceAllTitles(allData.titles)
            await replaceAllNotes(allData.notes)
            await replaceAllCheckins(allData.checkins)
            await replaceAllStays(allData.stays)
            await replaceAllFlights(allData.flights)
            toast.dismiss(toastId)
            await refresh()
        } else {
            alert('Data does not seem to be in any recognised format!')
        }
    }
}