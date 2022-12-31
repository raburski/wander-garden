import { createContext, useState, useContext } from "react"
import { zipsonTransforms, LocalStorageAdapter, useStatePersistedCallback } from 'storage'
import { useCheckins } from "domain/swarm"
import { useHomes } from 'domain/homes'
import { createTimelineEvents } from "./events"

export const TimelineContext = createContext({})

const localStorageEvents = new LocalStorageAdapter('timeline.events', '[]', zipsonTransforms)
const initialLocalStorageEventsValue = localStorageEvents.get()

export function TimelineProvider(props) {
    const [events, setEventsState] = useState(initialLocalStorageEventsValue)
    const [checkins] = useCheckins()
    const [homes] = useHomes()

    const setEvents = useStatePersistedCallback(events, setEventsState, localStorageEvents.set.bind(localStorageEvents))

    if (events.length === 0 && checkins.length > 0) {
        setEvents(createTimelineEvents(checkins, { homes }))
    }

    // TODO: add caching etc
    const refresh = () => {
        setEventsState([])
    }

    const value = {
        events: [events, setEvents],
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
