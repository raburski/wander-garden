import { useRefreshTrips } from "./trips"
import toast from "react-hot-toast"

export default function useRefresh() {
    const refreshTrips = useRefreshTrips()
    return async function refresh() {
        const toastId = toast.loading('Refreshing your data...')
        await refreshTrips()
        toast.dismiss(toastId)
    }
}