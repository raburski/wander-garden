import { Checkin, checkinsStorage, getAllCheckins } from "domain/swarm"
import { Stay, StayPlaceType, getAllStays } from "domain/stays"
import arrayQueryReplace, { some } from "domain/timeline/arrayQueryReplace"
import moment from "moment"
import { LocationHighlight, LocationHighlightType, Trip, TripPhase } from "./types"
import { cleanLocation, isEqualLocation } from "domain/location"
import { isDateBetween } from "date"


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

function getCheckins(since: string, until: string, checkins: Checkin[]) {
    return checkins.filter(checkin => moment.unix(checkin.createdAt).isBetween(since, until))
}

function getPhases(stays: Stay[], checkins: Checkin[]) {
    let phases: TripPhase[] = []

    const firstStay = stays[0]
    phases.push({ 
        stay: firstStay, 
        since: firstStay.since, 
        until: firstStay.until,
        checkins: getCheckins(firstStay.since, firstStay.until, checkins)
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
                lastPhase.checkins = getCheckins(lastPhase.since, currentStay.until, checkins)
            } else {
                phases.push({ 
                    stay: currentStay, 
                    since: currentStay.since, 
                    until: currentStay.until, 
                    checkins: getCheckins(currentStay.since, currentStay.until, checkins)
                })
            }
        } else {
            phases.push({ 
                stay: undefined, 
                since: olderStay.until, 
                until: currentStay.since,
                checkins: getCheckins(olderStay.until, currentStay.since, checkins)
            })
            phases.push({ 
                stay: currentStay, 
                since: currentStay.since, 
                until: currentStay.until,
                checkins: getCheckins(currentStay.since, currentStay.until, checkins)
             })
        }
    }

    return phases
}


function groupStays(checkins: Checkin[]) {
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
            const filteredCheckins = checkins.filter(checkin => moment.unix(checkin.createdAt).isBetween(stays[0].since, stays[stays.length - 1].until))
            
            const phases = getPhases(stays, filteredCheckins)
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
    // Sorted: oldest to newest
    const sortedStays = [...stays].sort((a: Stay, b: Stay) => moment(a.since).diff(moment(b.since)))
    const trips = arrayQueryReplace(groupStays(checkins), sortedStays)
    console.log(trips)
    return trips
}