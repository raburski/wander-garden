import { Trip } from "domain/trips/types"
import { Money } from "type"

export function addTripPrices(trip: Trip): Money[] {
    return trip.phases.reduce((acc, phase) => {
        const stayPrice = phase.stay?.price
        if (!stayPrice) return acc

        const currentPrice = acc.find(m => m.currency.toUpperCase() === stayPrice!.currency.toUpperCase())
        if (currentPrice) {
            currentPrice.amount = currentPrice.amount + stayPrice!.amount
        } else {
            acc.push({ amount: stayPrice.amount, currency: stayPrice.currency.toUpperCase() })
        }
        return acc
    }, [] as Money[])
}