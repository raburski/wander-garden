import { useReplaceAllNotes } from "./notes"
import { useRefreshStats } from "./stats"
import { useReplaceAllStays } from "./stays"
import { useClearData } from "./swarm"
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
    const refresh = useRefresh()
    return async function clearAll() {
        await clearSwarmData()
        await replaceAllTitles({})
        await replaceAllStays([])
        await replaceAllTours([])
        await replaceAllNotes([])
        await refresh(false)
    }
}