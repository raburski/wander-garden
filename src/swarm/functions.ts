import moment from 'moment'
import { cleanLocation, isEqualLocationCity, distance } from '../location'
import type { Location } from '../location'
import type { Moment } from "moment"

export type { Location } from '../location'

export type Date = string | Moment

export interface Venue {
    location: Location
}

export interface Checkin {
    venue: Venue
    createdAt: number
}

export interface Home {
    location: Location
    since?: Date
    until?: Date
}

export function isEqualCountry(leftCheckin: Checkin, rightCheckin: Checkin) {
    return leftCheckin?.venue?.location?.country == rightCheckin?.venue?.location?.country
}

export function isEqualCity(leftCheckin: Checkin, rightCheckin: Checkin) {
    return isEqualLocationCity(leftCheckin.venue.location, rightCheckin.venue.location)
}

export function isEqualState(leftCheckin: Checkin, rightCheckin: Checkin) {
    return cleanLocation(leftCheckin.venue.location.state) == cleanLocation(rightCheckin.venue.location.state)
}

export function hasCity(checkin: Checkin) {
    return !!checkin.venue.location.city
}

export function hasState(checkin: Checkin) {
    return !!checkin.venue.location.state
}


export function getCheckinLocation(checkin: Checkin): Location | undefined {
    const location = checkin?.venue?.location
    return location ? {
        address: location.address,
        city: location.city,
        state: location.state,
        country: location.country,
        cc: location.cc,
        postalCode: location.postalCode,
        lat: location.lat,
        lng: location.lng,
    } : undefined
}

export function getDistanceBetweenCheckins(checkin1: Checkin, checkin2: Checkin) {
    const location1 = getCheckinLocation(checkin1)
    const location2 = getCheckinLocation(checkin2)
    if (!location1 || !location2) {
        return undefined
    }
    return distance(location1.lat, location1.lng, location2.lat, location2.lng)
}

export function createPotentialHome(location: Location, since?: Date, until?: Date): Home {
    return {
        location,
        since: typeof since === 'string' ? since : since && since.format('YYYY-MM-DD'),
        until: typeof until === 'string' ? until : until && until.format('YYYY-MM-DD'),
    }
}

export function createPotentialHomeWithCheckin(checkin: Checkin, since?: Date, until?: Date) {
    const location = getCheckinLocation(checkin)
    return location ? createPotentialHome(location, since, until) : undefined
}

export function getCheckinDate(checkin: Checkin): Moment {
    return moment.unix(checkin.createdAt)
}

export function getPotentialHomes(checkins: [Checkin?] = []): [Home?] {
    if (checkins.length === 0) return []

    let currentHomeCheckin: Checkin | undefined = undefined
    let currentHomeCheckinCity: string | undefined = undefined

    const potentialHomes: [Home?] = []
    const cityWeight: {[name: string]: number} = {}
    // make those dynamic depending on user checkin ratios
    const WEIGHT_THRESHOLD = 30 // ~miesiąc
    const WEIGHT_DETERIORATE = 0.98 // per day
    const WEIGHT_INCREASE = 1.6

    function deteriorateCities(numberOfDays: number) {
        const weight = Math.pow(WEIGHT_DETERIORATE, numberOfDays)
        for (let city of Object.keys(cityWeight)) {
            cityWeight[city] = cityWeight[city] < 0.1 ? 0 : cityWeight[city] * weight
        }
    }

    for (let i = checkins.length - 2; i >= 0; i--) {
        let currentWeight = WEIGHT_INCREASE

        const olderCheckin: Checkin = checkins[i + 1]!
        const checkin: Checkin = checkins[i]!
        const date = getCheckinDate(checkin)
        const olderDate = getCheckinDate(olderCheckin)

        const city = cleanLocation(checkin.venue.location.city)
        const olderCity = cleanLocation(olderCheckin.venue.location.city)

        const duration = moment.duration(date.diff(olderDate))
        const daysDuration = duration.asHours() / 24
        
        deteriorateCities(daysDuration)

        if (!city) continue;
        if (city === olderCity) {
            currentWeight = currentWeight * daysDuration
        }
        cityWeight[city] = (cityWeight[city] || 0) + currentWeight
        
        if (currentHomeCheckinCity === city) continue

        if (cityWeight[city] > WEIGHT_THRESHOLD && cityWeight[city] > (currentHomeCheckinCity ? cityWeight[currentHomeCheckinCity] : 0)) {
            if (currentHomeCheckin) {
                let lastCheckInCurrentHome: Checkin | undefined = undefined
                const currentHomeCheckinIndex = currentHomeCheckin ? checkins.indexOf(currentHomeCheckin) : 0
                // look since now until current home checkin to find last checkin in current location
                for (let index = i; index < currentHomeCheckinIndex; index++) {
                    const checkedCheckin = checkins[index]!
                    if (cleanLocation(checkedCheckin.venue.location.city) === currentHomeCheckinCity) {
                        lastCheckInCurrentHome = checkedCheckin
                        break
                    }
                }
                let firstCheckInNewHome: Checkin | undefined = undefined
                const currentHomeLastCheckinIndex = lastCheckInCurrentHome ? checkins.indexOf(lastCheckInCurrentHome) : 0
                // look since last checkin in current location till now  to find first checkin in new location
                for (let index = currentHomeLastCheckinIndex + 1; index >= i; index--) {
                    const checkedCheckin = checkins[index]!
                    if (cleanLocation(checkedCheckin.venue.location.city) === city) {
                        firstCheckInNewHome = checkedCheckin
                        break
                    }
                }
                // add previous home to the list
                potentialHomes.push(
                    createPotentialHomeWithCheckin(
                        currentHomeCheckin,
                        potentialHomes.length > 0 ? potentialHomes[potentialHomes.length - 1]?.until : undefined,
                        firstCheckInNewHome ? getCheckinDate(firstCheckInNewHome) : undefined,
                    )!
                )
            }
            currentHomeCheckin = checkin
            currentHomeCheckinCity = cleanLocation(currentHomeCheckin.venue.location.city)
        }
    }
    if (currentHomeCheckin) {
        // add previous home to the list
        potentialHomes.push(
            createPotentialHomeWithCheckin(
                currentHomeCheckin,
                potentialHomes.length > 0 ? potentialHomes[potentialHomes.length - 1]?.until : undefined
            )!
        )
    }
    return potentialHomes
}

