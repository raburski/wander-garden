import { Checkin, checkinsStorage, getAllCheckins, getCheckinDate } from "domain/swarm"
import { DEFAULT_HOME_LOCATION, Stay, StayPlaceType, StayType, getAllStays } from "domain/stays"
import arrayQueryReplace, { some } from "domain/timeline/arrayQueryReplace"
import moment from "moment"
import { LocationHighlight, LocationHighlightType, Trip, TripPhase, TripPhaseEvent, TripPhaseEventType } from "./types"
import { Location, LocationAccuracy, cleanLocation, isEqualApproximiteLocation, isEqualLocation, isEqualLocationCity, isEqualLocationCountry } from "domain/location"
import { isDateBetween } from "date"
import { getAllTours } from "domain/tours"
import { Tour } from "domain/tours/types"
import { isSignificant, onlyNonTransportation } from "domain/swarm/categories"
import { getAllFlights } from "domain/flights"
import { Flight } from "domain/flights/types"
import getAirport from 'domain/flights/airports'
import { getCountryCode } from "domain/country"
import countryFlagEmoji from "country-flag-emoji"
import { DataOrigin } from "type"
import { momentInLocalTimezone } from "domain/timezone"

interface CheckinConvertContext { location: Location }
function convertCheckinsIntoStays(checkins: Checkin[]): Stay[] {
    return arrayQueryReplace({
        pattern: some((checkin: Checkin, checkins: Checkin[], context: CheckinConvertContext) => {
            if (checkins.length === 0) {
                context.location = checkin.venue.location
                return true
            }

            if (isEqualLocationCity(context.location, checkin.venue.location)) {
                return true
            }
            return false
        }),
        result: (checkins: Checkin[]): Stay | undefined => {
            if (checkins.length <= 1) return undefined
            const since = getCheckinDate(checkins.first())
            const until = getCheckinDate(checkins.last())
            return {
                id: checkins.first().id,
                since: since.format(),
                until: until.format(),
                location: checkins.first().venue.location,
            }
        }
    }, checkins)
}

export function getHighlights(stays: Stay[], checkins: Checkin[]): LocationHighlight[] {

    const cityStays: { [city: string]: number } = {}
    const stateStays: { [state: string]: number } = {}
    const countryStays: { [country: string]: number } = {}

    const convertedCheckins = convertCheckinsIntoStays(checkins)
    // Remove possible checkins before and after the trip
    const convertedLimitedCheckins = convertedCheckins.slice(1, -1)
    const joinedStays = [...stays, ...convertedLimitedCheckins]

    joinedStays.forEach((stay, i) => {
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
            location: joinedStays.find(stay => cleanLocation(stay.location.country) === country)!.location
        }))
    } else if (countries.length === 1 && cities.length > 1) {
        return countries.map(country => ({
            type: LocationHighlightType.Country,
            location: joinedStays.find(stay => cleanLocation(stay.location.country) === country)!.location
        }))
    } else {
        return cities.map(city => ({
            type: LocationHighlightType.City,
            location: joinedStays.find(stay => cleanLocation(stay.location.city) === city)!.location
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

function isOvernightFlightConnection(flights: Flight[]) {
    if (!flights || flights.length === 0) {
        return false
    }
    // TODO: complexify maybe?
    return true
}

function getAirportLocation(airport: any): Location {
    return {
        cc: airport.country.toLowerCase(),
        city: airport.city,
        state: airport.state,
        lat: parseFloat(airport.lat),
        lng: parseFloat(airport.lng),
        country: countryFlagEmoji.get(airport.country).name,
    }
}

function getPhases(stays: Stay[], checkins: Checkin[], tours: Tour[], flights: Flight[]) {
    let phases: TripPhase[] = []

    // TODO: add sleeping on the plane automatic phases

    const firstStay = stays[0]
    phases.push({ 
        stay: firstStay, 
        since: firstStay.since, 
        until: firstStay.until,
        events: getPhaseEvents(firstStay.since, firstStay.until, checkins, tours),
        arriveBy: flights.filter(f => 
            moment(f.arrival.scheduled)
                .isBetween(
                    moment(firstStay.since).subtract(72, 'hours'), 
                    moment(firstStay.since).add(24, 'hours'))
        ),
    })

    for (let currentIndex = 1; currentIndex < stays.length; currentIndex++) {
        const currentStay = stays[currentIndex]
        const olderStay = stays[currentIndex - 1]

        const areOverlapping = Math.abs(moment(currentStay.since).diff(moment(olderStay.until), 'hours')) < 16
        if (areOverlapping) {
            if (isEqualLocation(currentStay.location, olderStay.location)) {
                // Stay extension
                const lastPhase = phases.last()
                lastPhase.until = currentStay.until
                lastPhase.stay!.until = currentStay.until
                lastPhase.events = getPhaseEvents(lastPhase.since, currentStay.until, checkins, tours)
            } else {
                phases.push({ 
                    stay: currentStay, 
                    since: currentStay.since, 
                    until: currentStay.until,
                    events: getPhaseEvents(currentStay.since, currentStay.until, checkins, tours),
                    arriveBy: flights.filter(f => 
                        moment(f.arrival.scheduled).isBetween(
                            moment(currentStay.since).subtract(24, 'hours'), 
                            moment(currentStay.since).add(24, 'hours'))
                    )
                })
            }
        } else {
            const arriveBy = flights.filter(f => 
                moment(f.arrival.scheduled).isBetween(
                    moment(olderStay.until).subtract(12, 'hours'), 
                    moment(currentStay.since).add(24, 'hours'))
            )
            if (isOvernightFlightConnection(arriveBy)) {
                const airport = getAirport(arriveBy.first().departure.airport)
                const stay: Stay = {
                    id: `overnight:${arriveBy.first().id}`,
                    placeType: StayPlaceType.Airplane,
                    since: olderStay.until, 
                    until: currentStay.since,
                    location: getAirportLocation(airport),
                    origin: DataOrigin.Generated,
                }
                phases.push({ 
                    stay, 
                    since: olderStay.until, 
                    until: currentStay.since,
                    events: getPhaseEvents(olderStay.until, currentStay.since, checkins, tours),
                })
            } else {
                phases.push({ 
                    stay: undefined, 
                    since: olderStay.until, 
                    until: currentStay.since,
                    events: getPhaseEvents(olderStay.until, currentStay.since, checkins, tours),
                })
            }
            phases.push({ 
                stay: currentStay, 
                since: currentStay.since, 
                until: currentStay.until,
                events: getPhaseEvents(currentStay.since, currentStay.until, checkins, tours),
                arriveBy,
             })
        }
    }

    const lastStayMoment = moment(phases.last().until).startOf('day')
    const flightsAfterLastStay = flights.filter(f => moment(f.departure.scheduled).isAfter(lastStayMoment))
    if (flightsAfterLastStay.length > 0) {
        phases.push({
            stay: { id: 'home', location: DEFAULT_HOME_LOCATION, type: StayType.Custom, placeType: StayPlaceType.Home, since: phases.last().until, until: flightsAfterLastStay.last().arrival.scheduled },
            since: phases.last().until,
            until: flightsAfterLastStay.last().arrival.scheduled,
            events: [],
            arriveBy: flightsAfterLastStay,
        })
    }

    return phases
}

const MIN_BETWEEN_CHEKINS = 5
function groupStays(allCheckins: Checkin[], tours: Tour[], flights: Flight[]) {
    let checkins = [...allCheckins.filter(onlyNonTransportation)]
    return {
        pattern: [
            some((stay: Stay, stays: Stay[]) => {
                if (stays.length === 0) return true
                if (stays.first().placeType == StayPlaceType.Home) return false
                if (stay.placeType === StayPlaceType.Home) return false

                const olderStay = stays[stays.length - 1]
                const daysDiff = moment(stay.since).diff(olderStay.until, 'days')
                if (daysDiff <= 6) return true

                // If inbewteen those two stays there are checkins nearby either of those places
                // then that is still part of the trip
                const firstCheckinIndex = checkins.findIndex((checkin: Checkin) => moment.unix(checkin.createdAt).isSameOrAfter(olderStay.until))
                const lastCheckinIndex = checkins.findIndex((checkin: Checkin) => !moment.unix(checkin.createdAt).isBefore(stay.since))
                const inBetweenCheckins = firstCheckinIndex > 0 ? checkins.slice(firstCheckinIndex - 1, lastCheckinIndex) : checkins.slice(0, lastCheckinIndex)
      
                const allNearby = inBetweenCheckins.reduce((acc: boolean, checkin: Checkin) => {
                    const location = checkin.venue.location
                    const isNearby = isEqualApproximiteLocation(location, olderStay.location) || isEqualApproximiteLocation(location, stay.location)
                    return acc && isNearby
                }, true)

                const allTheSameCountries = inBetweenCheckins.reduce((acc: boolean, checkin: Checkin) => {
                    const location = checkin.venue.location
                    const isSameCountry = location.cc.toLowerCase() === olderStay.location.cc.toLowerCase() || location.cc.toLowerCase() === stay.location.cc.toLowerCase()
                    return acc && isSameCountry
                }, true)

                if (daysDiff <= 10 && inBetweenCheckins.length >= MIN_BETWEEN_CHEKINS && allTheSameCountries) {
                    return true
                }

                if (daysDiff <= 14 && inBetweenCheckins.length >= MIN_BETWEEN_CHEKINS && allNearby) {
                    return true
                }

                return false
            }),
        ],
        result: (stays: Stay[]): Trip | undefined => {
            if (stays.first().placeType === StayPlaceType.Home) return undefined

            const firstCheckinIndex = checkins.findIndex((checkin: Checkin) => moment.unix(checkin.createdAt).isSameOrAfter(stays.first().since))
            const lastCheckinIndex = checkins.findIndex((checkin: Checkin) => !moment.unix(checkin.createdAt).isBefore(stays.last().until))
            const filteredCheckins = firstCheckinIndex > 0 ? checkins.slice(firstCheckinIndex - 1, lastCheckinIndex) : checkins.slice(0, lastCheckinIndex)
            checkins = checkins.slice(lastCheckinIndex)

            // const nonTransportCheckins = filteredCheckins.filter(onlyNonTransportation)
            const filteredTours = tours.filter(tour => {
                return moment(tour.date)
                    .isBetween(stays.first().since, stays.last().until)
            })

            const filteredFlights = flights.filter(flight => {
                return moment(flight.departure.scheduled)
                    .isBetween(
                        moment(stays.first().since).subtract(2, "days"), 
                        moment(stays.last().until).add(2, "days"))
            })

            const phases = getPhases(stays, filteredCheckins, filteredTours, filteredFlights)
            const highlights = getHighlights(stays, filteredCheckins)

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
    const flights = await getAllFlights()
    // Sorted: oldest to newest
    const sortedStays = stays
        .filter((s: Stay) => !s.disabled)
        .sort((a: Stay, b: Stay) => moment(a.since).diff(moment(b.since)))
    const sortedFlights = flights
        .sort((a: Flight, b: Flight) => moment(a.departure.scheduled).diff(moment(b.departure.scheduled)))
    const trips = arrayQueryReplace(groupStays(checkins, tours, sortedFlights), sortedStays)
    return trips
}