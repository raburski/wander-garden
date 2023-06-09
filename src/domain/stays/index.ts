import { useBookingStays } from "domain/bookingcom"
import { useAgodaStays } from "domain/agoda"
import { useAirbnbStays } from "domain/airbnb"
import { useClearData as useClearBookingData } from 'domain/bookingcom'
import { useClearData as useClearAirbnbData } from 'domain/airbnb'
import { useClearData as useClearAgodaData } from "domain/agoda"
import { StayType } from "./types"

export * from './Context'
export * from './types'

export function useStays(type: StayType) {
    const booking = useBookingStays()
    const airbnb = useAirbnbStays()
    const agoda = useAgodaStays()
    if (!type) return []

    switch (type) {
        case StayType.Agoda:
            return agoda
        case StayType.Booking:
            return booking
        case StayType.Airbnb:
            return airbnb
        default:
            throw new Error('No stays of this type!')
    }
}

export function useAllStays() {
    const [booking] = useBookingStays()
    const [airbnb] = useAirbnbStays()
    const [agoda] = useAgodaStays()
    const allStays = [...booking, ...airbnb, ...agoda]
    return [allStays]
}

export function useClearStayData(type: StayType) {
    const clearBookingData = useClearBookingData()
    const clearAirbnbData = useClearAirbnbData()
    const clearAgodaData = useClearAgodaData()
    if (!type) return undefined

    switch (type) {
        case StayType.Agoda:
            return clearAgodaData
        case StayType.Booking:
            return clearBookingData
        case StayType.Airbnb:
            return clearAirbnbData
        default:
            throw new Error('No stays of this type!')
    }
}