import { useBookingStays } from "domain/bookingcom"
import { useAgodaStays } from "domain/agoda"
import { useAirbnbStays } from "domain/airbnb"

export function useStays() {
    const [booking] = useBookingStays()
    const [airbnb] = useAirbnbStays()
    const [agoda] = useAgodaStays()
    const allStays = [...booking, ...airbnb, ...agoda]
    return [allStays]
}