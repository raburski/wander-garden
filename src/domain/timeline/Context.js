import { createContext, useState, useContext } from "react"
import { zipsonTransforms, LocalStorageAdapter, useStatePersistedCallback, jsonTransforms } from 'storage'
import { useCheckins } from "domain/swarm"
import { useHomes } from 'domain/homes'
import { createTimelineEvents } from "./events"
import { onlyUnique } from "array"
import { onlyNonTransportation } from "domain/swarm/categories"

export const TimelineContext = createContext({})

const localStorageEvents = new LocalStorageAdapter('timeline.events', '[]', zipsonTransforms)
const localStorageVisited = new LocalStorageAdapter('timeline.visited', '[]', jsonTransforms)
const initialLocalStorageEventsValue = localStorageEvents.get()
const initialLocalStorageVisitedValue = localStorageVisited.get()

export function TimelineProvider(props) {
    const [events, setEventsState] = useState(initialLocalStorageEventsValue)
    const [visitedCountryCodes, setVisitedCountryCodesState] = useState(initialLocalStorageVisitedValue)
    const [checkins] = useCheckins()
    const [homes] = useHomes()

    const setEvents = useStatePersistedCallback(events, setEventsState, localStorageEvents.set.bind(localStorageEvents))
    const setVisitedCountryCodes = useStatePersistedCallback(visitedCountryCodes, setVisitedCountryCodesState, localStorageVisited.set.bind(localStorageVisited))

    if (events.length === 0 && checkins.length > 0) {
        setVisitedCountryCodes(checkins.filter(onlyNonTransportation).map(checkin => checkin?.venue?.location?.cc).filter(onlyUnique))
        setEvents(createTimelineEvents(checkins, { homes }))
    }

    // TODO: add caching etc
    const refresh = () => {
        setEventsState([])
    }

    const value = {
        events: [events, setEvents],
        visitedCountryCodes: [visitedCountryCodes, setVisitedCountryCodes],
        refresh,
    }
    return <TimelineContext.Provider value={value} {...props}/>
}

export function useRefreshTimeline() {
    const context = useContext(TimelineContext)
    return context.refresh
}

export function useTimelineEvents() {
    const context = useContext(TimelineContext)
    return context.events
}

export function useVisitedCountryCodes() {
    const context = useContext(TimelineContext)
    return context.visitedCountryCodes
}
