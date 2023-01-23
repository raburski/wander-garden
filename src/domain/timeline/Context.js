import { createContext, useState, useContext } from "react"
import { zipsonTransforms, LocalStorageAdapter, useStatePersistedCallback, jsonTransforms } from 'storage'
import { useCheckins } from "domain/swarm"
import { useHomes } from 'domain/homes'
import { createTimelineEvents } from "./events"
import { onlyUnique } from "array"
import { onlyNonTransportation } from "domain/swarm/categories"
import { createTimelineGroups } from "./groups"

export const TimelineContext = createContext({})

const localStorageEvents = new LocalStorageAdapter('timeline.events', '[]', zipsonTransforms)
const localStorageGroups = new LocalStorageAdapter('timeline.groups', '[]', zipsonTransforms)
const localStorageVisited = new LocalStorageAdapter('timeline.visited', '[]', jsonTransforms)
const localStorageTitles = new LocalStorageAdapter('timeline.titles', '{}', jsonTransforms)
const initialLocalStorageEventsValue = localStorageEvents.get()
const initialLocalStorageGroupsValue = localStorageGroups.get()
const initialLocalStorageVisitedValue = localStorageVisited.get()
const initialLocalStorageTitlesValue = localStorageTitles.get()

export function TimelineProvider(props) {
    const [events, setEventsState] = useState(initialLocalStorageEventsValue)
    const [groups, setGroupsState] = useState(initialLocalStorageGroupsValue)
    const [visitedCountryCodes, setVisitedCountryCodesState] = useState(initialLocalStorageVisitedValue)
    const [titles, setTitlesState] = useState(initialLocalStorageTitlesValue)
    const [checkins] = useCheckins()
    const [homes] = useHomes()

    const setEvents = useStatePersistedCallback(events, setEventsState, localStorageEvents.set.bind(localStorageEvents))
    const setGroups = useStatePersistedCallback(groups, setGroupsState, localStorageGroups.set.bind(localStorageGroups))
    const setVisitedCountryCodes = useStatePersistedCallback(visitedCountryCodes, setVisitedCountryCodesState, localStorageVisited.set.bind(localStorageVisited))
    const setTitles = useStatePersistedCallback(titles, setTitlesState, localStorageTitles.set.bind(localStorageTitles))

    if (events.length === 0 && checkins.length > 0) {
        setVisitedCountryCodes(checkins.filter(onlyNonTransportation).map(checkin => checkin?.venue?.location?.cc).filter(onlyUnique))
        const timelineEvents = createTimelineEvents(checkins, { homes })
        const timelineGroups = createTimelineGroups(timelineEvents, { homes })
        setEvents(timelineEvents)
        setGroups(timelineGroups)
    }

    // TODO: add caching etc
    const refresh = () => {
        setEventsState([])
    }

    const value = {
        events: [events, setEvents],
        groups: [groups, setGroups],
        visitedCountryCodes: [visitedCountryCodes, setVisitedCountryCodes],
        titles: [titles, setTitles],
        refresh,
    }
    return <TimelineContext.Provider value={value} {...props}/>
}

export function useRefreshTimeline() {
    const context = useContext(TimelineContext)
    return context.refresh
}

function isDEV() {
    return process.env.NODE_ENV == 'development'
}

export function useTimelineEventsProd() {
    const context = useContext(TimelineContext)
    return context.events
}

export function useTimelineEventsDev() {
    const [checkins] = useCheckins()
    const [homes] = useHomes()
    return createTimelineEvents(checkins, { homes })
}

export const useTimelineEvents = isDEV() ? useTimelineEventsDev : useTimelineEventsProd


function useTimelineGroupsProd() {
    const context = useContext(TimelineContext)
    return context.groups
}

function useTimelineGroupsDev() {
    const [homes] = useHomes()
    const timelineEvents = useTimelineEvents()
    return [createTimelineGroups(timelineEvents, { homes })]
}

export const useTimelineGroups = isDEV() ? useTimelineGroupsDev : useTimelineGroupsProd


export function useVisitedCountryCodes() {
    const context = useContext(TimelineContext)
    return context.visitedCountryCodes
}

export function useTitle(id) {
    const context = useContext(TimelineContext)
    const [titles] = context.titles
    return titles[id]
}

export function useSetTitle(id) {
    const context = useContext(TimelineContext)
    const [titles, setTitles] = context.titles
    return (title) => setTitles({ ...titles, [id]: title })
}
