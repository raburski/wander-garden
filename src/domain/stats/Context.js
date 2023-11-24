import { onlyUnique } from "array"
import { getSeasonEmojiForRange } from "date"
import { getRegionEmojiForCountry } from "domain/badges"
import { getAllStays } from "domain/stays"
import { getAllCheckins } from "domain/swarm"
import { onlyNonTransportation } from "domain/swarm/categories"
import { getAllTrips } from "domain/trips"
import moment from "moment"
import { createContext, useContext } from "react"
import { LocalStorageAdapter, jsonTransforms, useSyncedStorage } from 'storage'

export const StatsContext = createContext({})

const localStorageStats = new LocalStorageAdapter('stats', '{}', jsonTransforms)

function getTripDays(trip) {
    return moment(trip.until).diff(moment(trip.since), 'days')
}

function getVisitedCountriesCodes(checkins, allStays) {
    const nonTransportCheckins = checkins.filter(onlyNonTransportation)

    return [
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
    return [...trips].sort((a, b) => lengths[a.id] > lengths[b.id]).first()
}

function getTotalDifferentHotels(stays) {
    return stays
        .map(stay => stay.accomodation?.name)
        .filter(Boolean)
        .filter(onlyUnique)
        .length
}

function getMostTimeSpentCountryCode(trips) {
    const countryDays = trips
        .flatMap(trip => trip.phases)
        .reduce((acc, phase) => {
            const countryCode = phase.stay?.location?.cc
            if (!countryCode) return acc
            acc[countryCode] = (acc[countryCode] || 0) + getTripDays(phase)
            return acc
        }, {})
    return Object.keys(countryDays).sort((a, b) => countryDays[a] > countryDays[b]).first()
}

function getFavouriteTravelSeason(trips) {
    const seasonDays = trips
        .flatMap(trip => trip.phases)
        .reduce((acc, phase) => {
            const emoji = getSeasonEmojiForRange(phase.since, phase.until)
            acc[emoji] = (acc[emoji] || 0) + getTripDays(phase)
            return acc
        }, {})
    return Object.keys(seasonDays).sort((a, b) => seasonDays[a] > seasonDays[b]).first()
}

function getFavouriteRegion(trips) {
    const regionDays = trips
        .flatMap(trip => trip.phases)
        .reduce((acc, phase) => {
            const countryCode = phase.stay?.location?.cc
            if (!countryCode) return acc

            const emoji = getRegionEmojiForCountry(countryCode)
            acc[emoji] = (acc[emoji] || 0) + getTripDays(phase)
            return acc
        }, {})
    return Object.keys(regionDays).sort((a, b) => regionDays[a] > regionDays[b]).first()
}

export function StatsProvider({ children }) {
    const [stats, setStats] = useSyncedStorage(localStorageStats)

    async function refresh() {
        const checkins = await getAllCheckins()
        const allStays = await getAllStays()
        const trips = await getAllTrips()

        const longestTrip = getLongestTrip(trips)

        const newStats = {
            visitedCountries: getVisitedCountriesCodes(checkins, allStays),
            mostTimeSpentCountry: getMostTimeSpentCountryCode(trips),
            totalTrips: trips.length,
            totalDaysAway: getTotalDaysAway(trips),
            longestTrip,
            longestTripDays: getTripDays(longestTrip),
            totalDifferentHotels: getTotalDifferentHotels(allStays),
            favouriteTravelSeason: getFavouriteTravelSeason(trips),
            favouriteRegion: getFavouriteRegion(trips),
        }
        await setStats(newStats)
    }

    const value = {
        stats,
        refresh,
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

