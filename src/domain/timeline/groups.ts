import moment from 'moment'
import Stack from '../stack'
import { isEqualLocationCity, isEqualApproximiteLocation, isEqualMetro } from '../location'
import { checkinHasCategory } from '../swarm/categories'
import { getEventDate, createTransportEvent } from './events'
import { EventType, TransportMode, GroupType, LocationHighlightType, PlainGroup } from './types'
import arrayQueryReplace, { some, any, start, end } from './arrayQueryReplace'
import { Checkin, ensureDateString } from "../swarm"
import { onlyUnique } from "../../array"
import { cleanLocation, isTheSameArea } from "../location"
import { getHomeForDate, getHomeForEvent, isEventAtHome } from './functions'

import type { Group, Event, CheckinEvent, TransportEvent, CalendarEvent, HomeGroup, TransportGroup, TripGroup, ContainerGroup, LocationHighlight, Context } from "./types"
import type { Location, Home } from '../location'
import type { Moment, MomentInput } from "moment"
import { useTimelineGroups } from "./Context"
import { useHomes } from "domain/homes"


interface TimelineConfig {
    tripsOnly?: boolean
    foreignOnly?: boolean
}

function firstEventsLocation(events: Event[]): Location | undefined {
    const checkinEvents = events.filter(e => e && e.type === EventType.Checkin) as [CheckinEvent?]
    const checkinEventWithCity = checkinEvents.find(e => e && e.location.city)
    if (checkinEventWithCity) {
        return checkinEventWithCity?.location 
    }
    const transportEvents = events.filter(e => e && e.type === EventType.Transport) as [TransportEvent?]
    const transportEventWithCity = transportEvents.find(e => e && e.to.city)
    return transportEventWithCity?.to
}

function getCheckinEventLocation(event: Event) {
    const checkinEvent = event as CheckinEvent
    return checkinEvent.location
}


const MOP_CATEGORIES = [
    '4d954b16a243a5684b65b473', // rest place
    '4bf58dd8d48988d16e941735' // fastfood
]

const MOP_INCLUDE_IN_TRIP = {
    pattern: [
        (e: TransportEvent) => e.type === EventType.Transport && e.mode === TransportMode.Car,
        some((e: CheckinEvent) => e.type === EventType.Checkin && e.checkin && checkinHasCategory(e.checkin, MOP_CATEGORIES)),
        (e: TransportEvent) => e.type === EventType.Transport && e.mode === TransportMode.Car,
    ],
    result: ([to, _, from]: [TransportEvent, CheckinEvent, TransportEvent]) =>
        createTransportEvent(from.mode, from.date, from.from, to.to, true)
}

const TRAIN_CLOSURE_FROM = {
    pattern: [
        start((e: TransportEvent) => e.type === EventType.Transport && e.mode === TransportMode.Train),
        some((e: CheckinEvent) => e.type === EventType.Checkin),
        end((e: TransportEvent) => e.type === EventType.Transport && e.mode !== TransportMode.Train && e.guess === true),
    ],
    result: (events: [Event]) => {
        const train = events[0] as TransportEvent
        const otherTransport = events[events.length - 1] as TransportEvent
        return [train, ...events.slice(1, -1), createTransportEvent(TransportMode.Train, otherTransport.date, otherTransport.from, otherTransport.to, otherTransport.guess)]
    }
}

const TRAIN_CLOSURE_TO = {
    pattern: [
        start((e: TransportEvent) => e.type === EventType.Transport && e.mode !== TransportMode.Train && e.guess === true),
        some((e: CheckinEvent) => e.type === EventType.Checkin),
        end((e: TransportEvent) => e.type === EventType.Transport && e.mode === TransportMode.Train),
    ],
    result: (events: [Event]) => {
        const train = events[events.length - 1] as TransportEvent
        const otherTransport = events[0] as TransportEvent
        return [createTransportEvent(TransportMode.Train, otherTransport.date, otherTransport.from, otherTransport.to, otherTransport.guess), ...events.slice(1, -1), train]
    }
}

export function createPhasesWithEvents(events: Event[]): Event[] {
    let currentEvent: Event | undefined = undefined
    const _events = arrayQueryReplace([
        MOP_INCLUDE_IN_TRIP,
        TRAIN_CLOSURE_FROM,
        TRAIN_CLOSURE_TO,
    ], events)
    const phases: Event[] = []
    for (let i = _events.length - 1; i >= 0; i--) {
        const event = _events[i]
        if (event.type === EventType.Transport) {
            if (currentEvent) {
                phases.unshift(currentEvent)
                currentEvent = undefined
            }
            phases.unshift(event)
        } else if (event.type === EventType.Checkin) {
            if (!currentEvent) {
                if (event.location?.city) {
                    currentEvent = event
                }
            } else {
                const currentCheckinEvent = currentEvent as CheckinEvent
                if (isTheSameArea(currentCheckinEvent.location, event.location)) {
                    if (!currentCheckinEvent.location.city && event.location.city) {
                        currentEvent = event
                    }
                } else {
                    if (event.location.city) {
                        phases.unshift(currentEvent)
                        currentEvent = event
                    }
                }
            }
        }
    }
    if (currentEvent) {
        phases.unshift(currentEvent)
    }
    return phases
}

export function getGroupHighlights(group: Group): LocationHighlight[] {
    switch (group.type) {
        case GroupType.Home:
            return [(group as HomeGroup).highlight]
        case GroupType.Trip:
            return (group as TripGroup).highlights
        case GroupType.Container:
            return (group as ContainerGroup).highlights
        case GroupType.Transport:
            return [(group as TransportGroup).highlight]
        default:
            return []
    }
}

export function createTripGroup(events: Event[]): TripGroup | undefined {
    if (events.length === 0) { return undefined }
    const since = events[events.length - 1].date
    const until = events[0].date
    const highlights = getHighlightsFromEvents(events)
    return highlights ? {
        id: `trip-${events[0].id}`,
        type: GroupType.Trip,
        highlights,
        phases: createPhasesWithEvents(events),
        since,
        until,
        events,
    } : undefined
}

export function createTransportGroup(events: Event[]): TransportGroup | undefined {
    if (events.length === 0) { return undefined }
    const location = firstEventsLocation(events)
    const since = events[events.length - 1].date
    const until = events[0].date
    return location ? {
        id: `transport-${events[0].id}`,
        type: GroupType.Transport,
        highlight: { type: LocationHighlightType.Country, location: location }, // TODO: fix hightlight generation here
        phases: createPhasesWithEvents(events),
        events,
        since,
        until,
    } : undefined
}

export function createHomeGroup(events: Event[]): HomeGroup | undefined {
    if (events.length === 0) { return undefined }
    const location = firstEventsLocation(events)
    const since = events[events.length - 1].date
    const until = events[0].date
    return location ? {
        id: `home-${events[0].id}`,
        type: GroupType.Home,
        highlight: { type: LocationHighlightType.City, location: location },
        since,
        until,
        events,
    } : undefined
}

export function createPlainGroup(events: Event[]): PlainGroup | undefined {
    if (events.length === 0) { return undefined }
    const since = events[events.length - 1].date
    const until = events[0].date
    return {
        id: `plain-${events[0].id}`,
        type: GroupType.Plain,
        since,
        until,
        events,
    }
}

export function createContainerGroup(groups: Group[]): ContainerGroup | undefined {
    if (groups.length === 0) { return undefined }
    const since = groups[groups.length - 1].since
    const until = groups[0].until
    return {
        id: `container-${groups[0].id}`,
        type: GroupType.Container,
        highlights: groups.flatMap(getGroupHighlights),
        since,
        until,
        groups,
    }
}

export function createGroup(events: Event[] = [], isAtHome: boolean): Group | undefined {
    const isTransportOnly = events.reduce((acc, e: Event) => acc && e.type === EventType.Transport, true)
    if (isTransportOnly) {
        return createTransportGroup(events)
    } else if (isAtHome) {
        return createHomeGroup(events)
    } else {
        return createTripGroup(events)
    }
}

function onlyCheckinEvents(event: Event): boolean {
    return event.type == EventType.Checkin
}

function uniqueEventsLocations(events: Event[]): Location[] {
    const checkinLocations = events.filter(e => e && e.type === EventType.Checkin).map(getCheckinEventLocation) as [Location]
    const countryCodes = checkinLocations.map(location => location.cc).filter(onlyUnique)
    const countryLocations = countryCodes.map(cc => checkinLocations.find(l => l.cc === cc)) as [Location]
    return countryLocations
}

export function getHighlightsFromEvents(events: Event[]): LocationHighlight[] {
    const cityCheckins: { [city: string]: number } = {}
    const stateCheckins: { [state: string]: number } = {}
    const countryCheckins: { [country: string]: number } = {}
    const checkinEvents = events.filter(onlyCheckinEvents) as CheckinEvent[]
    checkinEvents.forEach((e, i) => {
        const prevCheckinDate = checkinEvents[i - 1]?.date as MomentInput
        const nextCheckinDate = checkinEvents[i + 1]?.date as MomentInput
        const checkinMoment = moment(e.date as MomentInput)
        const prevCheckinHourDiff = prevCheckinDate ? moment(prevCheckinDate).diff(checkinMoment, 'hours') / 2 : 0
        const nextCheckinHourDiff = nextCheckinDate ? moment(checkinMoment).diff(nextCheckinDate, 'hours') / 2 : 0
        const checkinWeight = prevCheckinHourDiff + nextCheckinHourDiff
        // TODO: add weights based on checkin category
        const cleanCountry = cleanLocation(e.location.country)
        const cleanState = cleanLocation(e.location.state)
        const cleanCity = cleanLocation(e.location.city)
        if (cleanCountry) {
            countryCheckins[cleanCountry] = (countryCheckins[cleanCountry] || 0) + checkinWeight
        }
        if (cleanState && Object.keys(countryCheckins).indexOf(cleanState) < 0) {
            stateCheckins[cleanState] = (stateCheckins[cleanState] || 0) + checkinWeight
        }
        if (cleanCity) {
            cityCheckins[cleanCity] = (cityCheckins[cleanCity] || 0) + checkinWeight
        }
    })
    const cities = Object.keys(cityCheckins)
    const states = Object.keys(stateCheckins)
    const countries = Object.keys(countryCheckins)

    const COUNTRY_CHECKIN_THRESHOLD = 6 // TODO: perhaps change to number of days?
    if (cities.length === 1) {
        const location = checkinEvents.find(e => cleanLocation(e.location.city) === cities[0])!.location
        return [{ type: LocationHighlightType.City, location }]
    }
    if (states.length === 1) {
        const location = checkinEvents.find(e => cleanLocation(e.location.state) === states[0])!.location
        return [{ type: LocationHighlightType.State, location }]
    }
    if (countries.length === 1 && checkinEvents.length > COUNTRY_CHECKIN_THRESHOLD) {
        const location = checkinEvents.find(e => cleanLocation(e.location.country) === countries[0])!.location
        return [{ type: LocationHighlightType.Country, location }]
    }

    /* MORE THAN SINGLE CITY/STATE/COUNTRY */

    const sum = (a: number, v: number) => a + v
    const citiesWeightSum = Object.values(cityCheckins).reduce(sum, 0)
    const statesWeightSum = Object.values(stateCheckins).reduce(sum, 0)
    const countriesWeightSum = Object.values(countryCheckins).reduce(sum, 0)

    cities.forEach(city => cityCheckins[city] = cityCheckins[city] / citiesWeightSum)
    states.forEach(city => stateCheckins[city] = stateCheckins[city] / statesWeightSum)
    countries.forEach(city => countryCheckins[city] = countryCheckins[city] / countriesWeightSum)

    const highlightsWithCheckinWeights = (THRESHOLD: number, onlyCountry = false): LocationHighlight[] => {
        const mainCities = cities.filter(city => cityCheckins[city] > THRESHOLD)
        if (!onlyCountry && mainCities.length > 0) {
            return mainCities
                .map(city => checkinEvents.find(e => cleanLocation(e.location.city) === city)!.location)
                .map(location => ({ type: LocationHighlightType.City, location }))
        }
        const mainStates = states.filter(state => stateCheckins[state] > THRESHOLD)
        if (!onlyCountry && mainStates.length > 0) {
            return mainStates
                .map(state => checkinEvents.find(e => cleanLocation(e.location.state) === state)!.location)
                .map(location => ({ type: LocationHighlightType.State, location }))
        }
        const mainCountries = countries.filter(country => countryCheckins[country] > THRESHOLD)
        if (mainCountries.length > 0) {
            return mainCountries
                .map(country => checkinEvents.find(e => cleanLocation(e.location.country) === country)!.location)
                .map(location => ({ type: LocationHighlightType.Country, location }))
        }
        return []
    }

    const MAIN_WEIGHT_THRESHOLD = 0.65
    const mainHighlights = highlightsWithCheckinWeights(MAIN_WEIGHT_THRESHOLD)
    if (mainHighlights.length > 0) {
        return mainHighlights
    }

    const averageCityWeight = Object.values(cityCheckins).reduce(sum, 0) / Object.keys(cityCheckins).length
    const averageStateWeight = Object.values(stateCheckins).reduce(sum, 0) / Object.keys(stateCheckins).length
    const averageCountryWeight = Object.values(countryCheckins).reduce(sum, 0) / Object.keys(countryCheckins).length

    if (Object.keys(countryCheckins).length > 2) {
        const weight = 1/(Object.keys(countryCheckins).length * 2)
        const fewHighlights = highlightsWithCheckinWeights(weight, true)
        if (fewHighlights.length > 0) {
            return fewHighlights
        }
    }

    const maxAverageWeight = Math.max(averageCityWeight, averageCountryWeight, averageStateWeight)
    const unknownHighlights = highlightsWithCheckinWeights(maxAverageWeight)
    if (unknownHighlights.length > 0) {
        return unknownHighlights
    }

    return []
}

function shallowArrayCompare(a1: any[], a2: any[]) {
    if (a1.length !== a2.length) {
        return false
    }
    return a1.map(i1 => a2.findIndex(i2 => i2 == i1)).reduce((acc, val) => acc && val >= 0, true)
}

type GroupQueryContext = { isAtHome: boolean }
function groupEvents(timelineContext: Context) {
    return {
        pattern: [
            (event: Event, _: Event[], context: GroupQueryContext) => {
                const home = getHomeForEvent(event, timelineContext)
                context.isAtHome = isEventAtHome(event, home)
                return true
            },
            any((event: Event, events: Event[], context: GroupQueryContext) => {
                if (event.type === EventType.Calendar) {
                    return true
                }
                const home = getHomeForEvent(event, timelineContext)
                const isAtHome = isEventAtHome(event, home)
                return context.isAtHome === isAtHome
            }),
        ],
        result: (events: Event[], context: GroupQueryContext) => {
            const calendarEvents = events.filter(e => e.type === EventType.Calendar)
            const otherEvents = events.filter(e => e.type != EventType.Calendar)
            if (calendarEvents.length === 0) {
                return createGroup(otherEvents, context.isAtHome)
            }
            return [
                createPlainGroup(calendarEvents),
                createGroup(otherEvents, context.isAtHome)
            ]
        }
    }
}

function isGroupAtHomeCountry(group: Group, home?: Home): boolean {
    if (!home) { return false }

    switch (group.type) {
        case GroupType.Container:
            const containerHighlights = (group as ContainerGroup).highlights
            return containerHighlights.some(h => h.location.country === home?.location.country)
        case GroupType.Home:
            return true
        case GroupType.Plain:
            return false
        case GroupType.Trip:
            const tripHighlights = (group as TripGroup).highlights
            return tripHighlights.some(h => h.location.country === home?.location.country)
        case GroupType.Transport:
            const hightlight = (group as TransportGroup).highlight
            return hightlight.location.country === home?.location.country
        default:
            return false 
    }
}

function cleanUngroupedEvents() {
    // Investigate why would there by any
    return {
        pattern: [(e: Event) => e.type === EventType.Checkin || e.type === EventType.Calendar || e.type === EventType.Transport],
        result: () => [],
    }
}


type GroupGroupsQueryContext = { isAtHomeCountry: boolean }
function groupGroups(timelineContext: Context) {
    return {
        pattern: [
            any((group: Group, groups: Group[], context: GroupGroupsQueryContext) => {
                const shouldGroup = group.type !== GroupType.Plain && group.type !== GroupType.Container
                if (!shouldGroup) { return false }

                const home = getHomeForDate(group.since, timelineContext.homes)
                const isAtHomeCountry = isGroupAtHomeCountry(group, home)
                if (groups.length === 0) {
                    context.isAtHomeCountry = isAtHomeCountry
                } else if (!isAtHomeCountry) {
                    return false
                }
                return context.isAtHomeCountry === isAtHomeCountry
            }),
        ],
        result: (groups: Group[], context: GroupGroupsQueryContext) => {
            return createContainerGroup(groups)
        }
    }
}

function filterGroupsBasedOnConfig(context: Context, config: TimelineConfig) {
    return (group: Group) => {
        if (config.tripsOnly && group.type === GroupType.Home) {
            return false
        } else if (config.foreignOnly) {
            const home = getHomeForDate(group.since, context.homes)
            return !isGroupAtHomeCountry(group, home)
        }
        return true
    }
}

export function createTimelineGroups(events: Event[] = [], context: Context = {homes: []}): Group[] {
    return arrayQueryReplace([
        groupEvents(context),
        cleanUngroupedEvents(),
    ], events)
}

export function useTimeline(config: TimelineConfig = {}): Group[] {
    const [groups] = useTimelineGroups()
    const [homes] = useHomes()
    const context = { homes }
    const cleanedGroups = groups.filter(filterGroupsBasedOnConfig(context, config))
    return arrayQueryReplace([
        groupGroups(context)
    ], cleanedGroups)
}

export function highlightTitle(highlight: LocationHighlight) {
    switch (highlight.type) {
        case LocationHighlightType.City:
            return highlight.location.city
        case LocationHighlightType.State:
            return highlight.location.state
        case LocationHighlightType.Country:
            return highlight.location.country
    }
}

export function titleFromLocationHighlights(highlights: LocationHighlight[]) {
    return highlights.map(highlightTitle).filter(onlyUnique).reverse().join(', ')
}
