import { isEqualLocation, isEqualLocationCity } from "domain/location"
import { Stay, useAllStays } from "domain/stays"
import moment, { Moment } from "moment"
import { Money } from "type"

export enum PhaseType {
    Stay = 'stay',
    Unknown = 'unknown',
}

export interface Phase {
    type: PhaseType
    since: string
    until: string
}

export interface StayPhase extends Phase {
    type: PhaseType.Stay
    stay: Stay
}

export interface UnknownPhase extends Phase {
    type: PhaseType.Unknown
}

export interface Trip {
    phases: Phase[]
}

function isDateBetween(date: Moment, start: Moment, end: Moment) {
    return date.isSameOrAfter(start, 'day') && date.isSameOrBefore(end, 'day')
}

function getPhases(since: string, until: string, _stays: Stay[]) {
    let phases: Phase[] = []
    let sortedStays = [..._stays]
    sortedStays.sort((a, b) => moment(a.since).diff(moment(b.since)))
    const sinceMoment = moment(since)
    const untilMoment = moment(until)
    let currentMoment = sinceMoment

    while (currentMoment.isBefore(untilMoment, 'day')) {
        const currentStayIndex = sortedStays.findIndex(stay => isDateBetween(currentMoment, moment(stay.since), moment(stay.until)))
        if (sortedStays.length === 0) {
            phases.push({ type: PhaseType.Unknown, since: currentMoment.format(), until: untilMoment.format() })
            currentMoment = untilMoment
        } else if (currentStayIndex === 0) {
            const currentStay: Stay = sortedStays.shift()!
            const lastStay: Stay | undefined = phases.length > 0 ? (phases[phases.length - 1] as StayPhase).stay : undefined
            if (currentStay?.location && lastStay?.location && isEqualLocation(currentStay?.location, lastStay?.location)) {
                phases[phases.length - 1].until = currentStay!.until
            } else {
                phases.push({ type: PhaseType.Stay, stay: currentStay, since: currentMoment.format(), until: currentStay!.until } as StayPhase)
            }
            currentMoment = moment(currentStay!.until)
        } else if (currentStayIndex > 1) {
            sortedStays = sortedStays.slice(currentStayIndex)
        } else if (currentStayIndex < 0) {
            const nextStay = sortedStays[0]
            phases.push({ type: PhaseType.Unknown, since: currentMoment.format(), until: nextStay.since })
            currentMoment = moment(nextStay.since)
        }
    }


    return phases
}

export function addTripPrices(trip: Trip): Money[] {
    return trip.phases.reduce((acc, phase) => {
        if (phase.type === PhaseType.Stay) {
            const stayPrice = (phase as StayPhase).stay.price
            if (!stayPrice) return acc

            const currentPrice = acc.find(m => m.currency.toUpperCase() === stayPrice!.currency.toUpperCase())
            if (currentPrice) {
                currentPrice.amount = currentPrice.amount + stayPrice!.amount
            } else {
                acc.push({ amount: stayPrice.amount, currency: stayPrice.currency.toUpperCase() })
            }
        }
        return acc
    }, [] as Money[])
}

export default function useTrip(since: string, until: string): Trip | undefined {
    const stays = useAllStays()
    if (!since || !until) return undefined



    console.log('???', stays.length, since, until)
    stays.sort((a, b) => moment(b.since).diff(moment(a.since)))
    const knownStays = stays.filter(stay => 
        moment(stay.since).isSameOrAfter(since, 'day')
        && moment(stay.since).isBefore(until, 'day')
    )
    return {
        phases: getPhases(since, until, knownStays)
    }
}
