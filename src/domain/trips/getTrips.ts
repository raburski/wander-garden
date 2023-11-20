import { Checkin, checkinsStorage, getAllCheckins } from "domain/swarm"
import { Stay, StayPlaceType, getAllStays } from "domain/stays"
import arrayQueryReplace, { some } from "domain/timeline/arrayQueryReplace"
import moment from "moment"
import { LocationHighlight, LocationHighlightType, Trip, TripPhase, TripPhaseEvent, TripPhaseEventType } from "./types"
import { cleanLocation, isEqualLocation } from "domain/location"
import { isDateBetween } from "date"
import { getAllTours } from "domain/tours"
import { Tour } from "domain/tours/types"
import { isSignificant } from "domain/swarm/categories"


export function getHighlightsFromStays(stays: Stay[]): LocationHighlight[] {

    const cityStays: { [city: string]: number } = {}
    const stateStays: { [state: string]: number } = {}
    const countryStays: { [country: string]: number } = {}

    stays.forEach((stay, i) => {
        const stayLength = moment(stay.until).diff(stay.since, 'days')

        const cleanCountry = cleanLocation(stay.location.country)
        const cleanState = cleanLocation(stay.location.state)
        const cleanCity = cleanLocation(stay.location.city)
        if (cleanCountry) {
            countryStays[cleanCountry] = (countryStays[cleanCountry] || 0) + stayLength
        }
        if (cleanState) {
            stateStays[cleanState] = (stateStays[cleanState] || 0) + stayLength
        }
        if (cleanCity) {
            cityStays[cleanCity] = (cityStays[cleanCity] || 0) + stayLength
        }
    })
    const cities = Object.keys(cityStays)
    const states = Object.keys(stateStays)
    const countries = Object.keys(countryStays)

    if (countries.length > 1) {
        return countries.map(country => ({
            type: LocationHighlightType.Country,
            location: stays.find(stay => cleanLocation(stay.location.country) === country)!.location
        }))
    } else if (countries.length === 1 && cities.length > 1) {
        return countries.map(country => ({
            type: LocationHighlightType.Country,
            location: stays.find(stay => cleanLocation(stay.location.country) === country)!.location
        }))
    } else {
        return cities.map(city => ({
            type: LocationHighlightType.City,
            location: stays.find(stay => cleanLocation(stay.location.city) === city)!.location
        }))
    }

    return []
}

export function getPhaseEventMoment(event: TripPhaseEvent) {
    switch (event.type) {
        case TripPhaseEventType.Checkin:
            return moment.unix(event.checkin!.createdAt)
        case TripPhaseEventType.Tour:
            return moment(event.tour!.date)
        default:
            return moment()
    }
}

function getCheckins(since: string, until: string, checkins: Checkin[]) {
    return checkins.filter(checkin => moment.unix(checkin.createdAt).isBetween(since, until))
}

function getTours(since: string, until: string, tours: Tour[]) {
    return tours.filter(tour => moment(tour.date).isBetween(since, until))
}

function getPhaseEvents(since: string, until: string, checkins: Checkin[], tours: Tour[]): TripPhaseEvent[] {
    const events = [
        ...getCheckins(since, until, checkins).map(checkin => ({ type: TripPhaseEventType.Checkin, checkin }) as TripPhaseEvent),
        ...getTours(since, until, tours).map(tour => ({ type: TripPhaseEventType.Tour, tour }) as TripPhaseEvent),
    ]
    events.sort((a, b) => getPhaseEventMoment(b).isBefore(getPhaseEventMoment(a)) ? 1 : -1)
    return events
}

function getPhases(stays: Stay[], checkins: Checkin[], tours: Tour[]) {
    let phases: TripPhase[] = []

    const firstStay = stays[0]
    phases.push({ 
        stay: firstStay, 
        since: firstStay.since, 
        until: firstStay.until,
        events: getPhaseEvents(firstStay.since, firstStay.until, checkins, tours)
    })

    for (let currentIndex = 1; currentIndex < stays.length; currentIndex++) {
        const currentStay = stays[currentIndex]
        const olderStay = stays[currentIndex - 1]

        const areOverlapping = moment(currentStay.since).isSame(olderStay.until, 'day')
        if (areOverlapping) {
            if (isEqualLocation(currentStay.location, olderStay.location)) {
                // Stay extension
                const lastPhase = phases.last()
                lastPhase.until = currentStay.until
                lastPhase.events = getPhaseEvents(lastPhase.since, currentStay.until, checkins, tours)
            } else {
                phases.push({ 
                    stay: currentStay, 
                    since: currentStay.since, 
                    until: currentStay.until,
                    events: getPhaseEvents(currentStay.since, currentStay.until, checkins, tours),
                })
            }
        } else {
            phases.push({ 
                stay: undefined, 
                since: olderStay.until, 
                until: currentStay.since,
                events: getPhaseEvents(olderStay.until, currentStay.since, checkins, tours),
            })
            phases.push({ 
                stay: currentStay, 
                since: currentStay.since, 
                until: currentStay.until,
                events: getPhaseEvents(currentStay.since, currentStay.until, checkins, tours),
             })
        }
    }

    return phases
}


function groupStays(checkins: Checkin[], tours: Tour[]) {
    return {
        pattern: [
            some((stay: Stay, stays: Stay[]) => {
                if (stays.length === 0) return true

                const olderStay = stays[stays.length - 1]
                const daysDiff = moment(stay.since).diff(olderStay.until, 'days')
                if (daysDiff <= 6) return true

                return false
            }),
        ],
        result: (stays: Stay[]): Trip => {
            const filteredCheckins = checkins.filter(checkin => moment.unix(checkin.createdAt).isBetween(stays.first().since, stays.last().until))
            const filteredTours = tours.filter(tour => {
                return moment(tour.date).isBetween(stays.first().since, stays.last().until)
            })

            const phases = getPhases(stays, filteredCheckins, filteredTours)
            const highlights = getHighlightsFromStays(stays)
            return {
                id: `trip:${stays[0].id}`,
                since: phases.first().since,
                until: phases.last().until,
                highlights: highlights,
                phases: phases,
            }
        }
    }
}

export default async function getTrips(): Promise<Trip[]> {
    const stays = await getAllStays()
    const checkins = await getAllCheckins()
    const tours = await getAllTours()
    const significantCheckins = checkins.filter(isSignificant)
    // Sorted: oldest to newest
    const sortedStays = [...stays].sort((a: Stay, b: Stay) => moment(a.since).diff(moment(b.since)))
    const trips = arrayQueryReplace(groupStays(significantCheckins, tours), sortedStays)
    console.log(trips)
    return trips
}