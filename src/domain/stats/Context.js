import { onlyUnique } from "array"
import countryFlagEmoji from "country-flag-emoji"
import { SEASON, SEASON_TO_EMOJI, getDaysBetween, seasonForDate } from "date"
import { getRegionForCountry } from "domain/badges"
import { StayPlaceType, getAllStays } from "domain/stays"
import { getAllCheckins } from "domain/swarm"
import { onlyNonTransportation } from "domain/swarm/categories"
import { getAllTrips } from "domain/trips"
import moment from "moment"
import { createContext, useContext } from "react"
import { LocalStorageAdapter, jsonTransforms, useSyncedStorage } from 'storage'

export const StatsContext = createContext({})

const localStorageStats = new LocalStorageAdapter('stats', '{}', jsonTransforms)

function getTripDays(trip) {
    return moment(trip.until).startOf('day').diff(moment(trip.since).startOf('day'), 'days')
}

function countryCodeFromPhase(phase) {
    const stayCC = phase.stay?.location?.cc
    if (stayCC) return stayCC.toLowerCase()

    const checkinsCC = phase.events
        .map(e => e.checkin?.venue?.location?.cc)
        .filter(Boolean)
        .filter(onlyUnique)
    if (checkinsCC.length === 1) return checkinsCC.first().toLowerCase()

    return undefined
}

function getVisitedCountriesCodes(checkins, allStays, travelledCountries) {
    const nonTransportCheckins = checkins.filter(onlyNonTransportation)

    return [
        ...travelledCountries,
        ...nonTransportCheckins.map(checkin => checkin?.venue?.location?.cc.toLowerCase()),
        ...allStays.map(stay => stay.location.cc.toLowerCase()),
    ].filter(onlyUnique).filter(Boolean).reverse()
}

function getTotalDaysAway(trips) {
    return trips.reduce((acc, trip) => {
        return acc + getTripDays(trip)
    }, 0)
}

function getLongestTrip(trips) {
    const lengths = trips.reduce((acc, trip) => {
        acc[trip.id] = getTripDays(trip)
        return acc
    }, {})
    return [...trips].sort((a, b) => lengths[b.id] - lengths[a.id]).first()
}

function getTotalDifferentHotels(stays) {
    return stays
        .filter(stay => stay.placeType !== StayPlaceType.Home)
        .map(stay => stay.accomodation?.name)
        .filter(Boolean)
        .filter(onlyUnique)
        .length
}

function getFavouriteCountries(trips) {
    const countries = trips
        .flatMap(trip => trip.phases)
        .reduce((acc, phase) => {
            const countryCode = countryCodeFromPhase(phase)
            const countryName = phase.stay?.location?.country
            if (!countryCode) return acc
            const country = acc.find(a => a.code === countryCode)
            if (country) {
                country.days = country.days + getTripDays(phase)
            } else {
                const emoji = countryFlagEmoji.get(countryCode).emoji
                acc.push({ code: countryCode, emoji, days: getTripDays(phase), name: countryName })
            }
            return acc
        }, [])
    return countries.sort((a, b) => b.days - a.days)
}

function getFavouriteSeasons(trips) {
    const seasons = {
        [SEASON.SPRING]: { name: SEASON.SPRING, emoji: SEASON_TO_EMOJI[SEASON.SPRING], days: 0 },
        [SEASON.SUMMER]: { name: SEASON.SUMMER, emoji: SEASON_TO_EMOJI[SEASON.SUMMER], days: 0 },
        [SEASON.AUTUMN]: { name: SEASON.AUTUMN, emoji: SEASON_TO_EMOJI[SEASON.AUTUMN], days: 0 },
        [SEASON.WINTER]: { name: SEASON.WINTER, emoji: SEASON_TO_EMOJI[SEASON.WINTER], days: 0 },
    }

    trips
        .flatMap(trip => trip.phases)
        .flatMap(phase => getDaysBetween(phase.since, phase.until))
        .filter(onlyUnique)
        .forEach(date => {
            const season = seasonForDate(date)
            seasons[season].days = seasons[season].days + 1
        })
    
    return Object.values(seasons).sort((a, b) => b.days - a.days)
}

function getFavouriteRegions(trips) {
    const regions = trips
        .flatMap(trip => trip.phases)
        .reduce((acc, phase) => {
            const countryCode = countryCodeFromPhase(phase)
            if (!countryCode) return acc

            const days = getTripDays(phase)
            const region = getRegionForCountry(countryCode)
            if (!region) return acc

            const object = acc.find(o => o.emoji === region.emoji)
            if (object) {
                object.days = object.days + days
            } else {
                acc.push({ emoji: region.emoji, name: region.name, days })
            }
            return acc
        }, [])

    return regions.sort((a, b) => b.days - a.days)
}

export function StatsProvider({ children }) {
    const [stats, setStats] = useSyncedStorage(localStorageStats)

    // Those are manually marked by the user on the map
    const travelledCountries = stats.travelledCountries || []

    async function refresh(updatedTravelledCountries) {
        const checkins = await getAllCheckins()
        const allStays = await getAllStays()
        const trips = await getAllTrips()

        const _travelledCountries = updatedTravelledCountries || travelledCountries

        if (!trips || trips.length === 0) {
            return await setStats({ travelledCountries: _travelledCountries, visitedCountries: _travelledCountries })
        }

        const longestTrip = getLongestTrip(trips)

        const newStats = {
            travelledCountries: _travelledCountries,
            visitedCountries: getVisitedCountriesCodes(checkins, allStays, _travelledCountries),
            totalTrips: trips?.length || 0,
            totalDaysAway: getTotalDaysAway(trips),
            longestTrip,
            longestTripDays: getTripDays(longestTrip),
            totalDifferentHotels: getTotalDifferentHotels(allStays),
            favouriteSeasons: getFavouriteSeasons(trips),
            favouriteRegions: getFavouriteRegions(trips),
            favouriteCountries: getFavouriteCountries(trips),
        }
        await setStats(newStats)
    }

    async function setCountryTravelled(countryCode, travelled) {
        const updatedTravelledCountries = travelled ? [...travelledCountries, countryCode].filter(onlyUnique) : travelledCountries.filter(cc => cc !== countryCode)
        await refresh(updatedTravelledCountries)
    }

    const value = {
        stats,
        refresh,
        setCountryTravelled,
    }

    return (
        <StatsContext.Provider value={value}>
            {children}
        </StatsContext.Provider>
    )
}

export function useStats() {
    const context = useContext(StatsContext)
    return context.stats
}

export function useRefreshStats() {
    const context = useContext(StatsContext)
    return context.refresh
}

export function useVisitedCountryCodes() {
    const context = useContext(StatsContext)
    return context.stats?.visitedCountries || []
}

export function useAllCountryCodes() {
    return countryFlagEmoji.countryCodes
}

export function useSetCountryTravelled() {
    const context = useContext(StatsContext)
    return context.setCountryTravelled
}