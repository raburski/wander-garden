import { isEqualLocation, isEqualLocationCity, Location } from "domain/location"
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
    guessedLocations: Location[]
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
            phases.push({ type: PhaseType.Unknown, since: currentMoment.format(), until: untilMoment.format(), guessedLocations: [] } as UnknownPhase)
            currentMoment = untilMoment
        } else if (currentStayIndex === 0) { // first remaining stay
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
            phases.push({ type: PhaseType.Unknown, since: currentMoment.format(), until: nextStay.since, guessedLocations: [] } as UnknownPhase)
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

function enhanceWithGuessedLocations(phases: Phase[]) {
    // TODO: make it waaaay better with checkins data
    for (let i = 0; i < phases.length; i++) {
        if (phases[i].type === PhaseType.Unknown && i > 0) {
            const currentGroup = phases[i] as UnknownPhase
            const previousGroup = phases[i - 1] as StayPhase
            const nextGroup = phases[i + 1] as StayPhase | undefined
            currentGroup.guessedLocations.push(previousGroup.stay.location)
            if (nextGroup && !isEqualLocationCity(previousGroup.stay.location, nextGroup.stay.location)) {
                currentGroup.guessedLocations.push(nextGroup.stay.location)
            }
        }
    }
    return phases
}

export default function useTrip(since: string, until: string): Trip | undefined {
    const stays = useAllStays()
    if (!since || !until) return undefined

    stays.sort((a, b) => moment(b.since).diff(moment(a.since)))
    const knownStays = stays.filter(stay => 
        moment(stay.since).isSameOrAfter(since, 'day')
        && moment(stay.since).isBefore(until, 'day')
    )

    const phases = getPhases(since, until, knownStays)

    return {
        phases: enhanceWithGuessedLocations(phases)
    }
}
