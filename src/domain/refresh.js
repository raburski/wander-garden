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