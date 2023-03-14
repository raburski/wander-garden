import { createContext, useState, useContext, useMemo } from "react"
import { zipsonTransforms, LocalStorageAdapter, IndexedDBStorageAdapter, usePersistedEffect, jsonTransforms, useSyncedStorage } from 'storage'
import { useCheckins } from "domain/swarm"
import { useHomes } from 'domain/homes'
import { useBookingStays } from 'domain/bookingcom'
import { useAirbnbStays } from 'domain/airbnb'
import { createTimelineEvents } from "./events"
import { onlyUnique } from "array"
import { onlyNonTransportation } from "domain/swarm/categories"
import { createTimelineGroups } from "./groups"
import moment from 'moment'
import { useAgodaStays } from "domain/agoda"
import { checkinsStorage } from "domain/swarm"
import { bookingStaysStorage } from "domain/bookingcom"
import { agodaStaysStorage } from "domain/agoda"
import { airbnbStaysStorage } from "domain/airbnb"
import { homesStorage } from "domain/homes"

export const TimelineContext = createContext({})

const localStorageVisited = new LocalStorageAdapter('timeline.visited', '[]', jsonTransforms)
const localStorageTitles = new LocalStorageAdapter('timeline.titles', '{}', jsonTransforms)

const timelineGroupsStorage = new IndexedDBStorageAdapter([], 'wander-garden', 'timeline-groups')

export function TimelineProvider({ children }) {
    const [groups, setGroups] = useSyncedStorage(timelineGroupsStorage)
    const [visitedCountryCodes, setVisitedCountryCodes] = useSyncedStorage(localStorageVisited)
    const [titles, setTitles] = useSyncedStorage(localStorageTitles)

    async function refresh() {
        const homes = await homesStorage.get()
        const checkins = await checkinsStorage.get()
        const allStays = await Promise.all([
            bookingStaysStorage.get(),
            agodaStaysStorage.get(),
            airbnbStaysStorage.get(),
        ]).then(v => v.flat())

        checkins.sort((a, b) => b.createdAt - a.createdAt)
        allStays.sort((a, b) => moment(b.since).diff(moment(a.since)))

        setVisitedCountryCodes([
            ...checkins.filter(onlyNonTransportation).map(checkin => checkin?.venue?.location?.cc.toLowerCase()),
            ...allStays.map(stay => stay.location.cc.toLowerCase()),
        ].filter(onlyUnique))
        const timelineEvents = createTimelineEvents({ checkins, stays: allStays }, { homes })
        const timelineGroups = createTimelineGroups(timelineEvents, { homes })
        setGroups(timelineGroups)
    }

    const value = useMemo(() => {
        const sortedGroups = [...groups].sort((a, b) => moment(b.since).diff(moment(a.since)))
        return {
            groups: [sortedGroups, setGroups],
            visitedCountryCodes: [visitedCountryCodes, setVisitedCountryCodes],
            titles: [titles, setTitles],
            refresh
        }
    }, [groups.length, visitedCountryCodes.length, titles])

    return (
        <TimelineContext.Provider value={value}>
            {children}
        </TimelineContext.Provider>
    )
}

export function useTimelineEvents() {
    const context = useContext(TimelineContext)
    return context.events
}

export function useTimelineGroups() {
    const context = useContext(TimelineContext)
    return context.groups
}

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

export function useRefreshTimeline() {
    const context = useContext(TimelineContext)
    return context.refresh
}
