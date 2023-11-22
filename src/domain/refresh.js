import { useReplaceAllNotes } from "./notes"
import { useReplaceAllStays } from "./stays"
import { useClearData } from "./swarm"
import { useReplaceAllTitles } from "./titles"
import { useReplaceAllTours } from "./tours"
import { useRefreshTrips } from "./trips"
import { useRefreshVisited } from "./visitedCountries"
import toast from "react-hot-toast"

export default function useRefresh() {
    const refreshTrips = useRefreshTrips()
    const refreshVisited = useRefreshVisited()
    return async function refresh() {
        const toastId = toast.loading('Refreshing your data...')
        await refreshVisited()
        await refreshTrips()
        toast.dismiss(toastId)
    }
}

export function useClearAll() {
    const clearSwarmData = useClearData()
    const replaceAllStays = useReplaceAllStays()
    const replaceAllTitles = useReplaceAllTitles()
    const replaceAllTours = useReplaceAllTours()
    const replaceAllNotes = useReplaceAllNotes()
    const refresh = useRefresh()
    return async function clearAll() {
        await clearSwarmData()
        await replaceAllTitles({})
        await replaceAllStays([])
        await replaceAllTours([])
        await replaceAllNotes([])
        await refresh()
    }
}