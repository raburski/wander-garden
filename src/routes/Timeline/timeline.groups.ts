import moment from 'moment'
import Stack from './stack'
import { isEqualLocationCity, isEqualApproximiteLocation } from '../../location'
import { checkinHasCategory } from '../../swarm/categories'
import { getEventDate, createTransportEvent } from './timeline.events'
import { EventType, TransportMode, GroupType } from './types'
import arrayQueryReplace, { some, any, start, end } from './arrayQueryReplace'

import type { Group, Event, CheckinEvent, TransportEvent, HomeGroup, TransportGroup, TripGroup } from "./types"
import type { Location } from '../../location'
import type { Moment, MomentInput } from "moment"
import type { Checkin, Home } from "../../swarm"

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

export function isTheSameArea(leftLocation: Location, rightLocation: Location) {
    if (leftLocation.city && rightLocation.city) {
        return isEqualLocationCity(leftLocation, rightLocation)
    }
    return isEqualApproximiteLocation(leftLocation, rightLocation)
}

// // Very simple for now!
// function createPhaseWithEvents(events) { 
//     const eventWithCity = events.find(e => e?.location?.city)
//     if (eventWithCity) {
//         return eventWithCity
//     }
//     return events[0]
// }

const MOP_CATEGORIES = [
    '4d954b16a243a5684b65b473', // rest place
    '4bf58dd8d48988d16e941735' // fastfood
]

const MOP_INCLUDE_IN_TRIP = {
    pattern: [
        (e: TransportEvent) => e.type === EventType.Transport && e.mode === TransportMode.Car,
        some((e: CheckinEvent) => e.type === EventType.Checkin && checkinHasCategory(e.checkin, MOP_CATEGORIES)),
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

export function createMultihopGroup(events: Event[]): TripGroup | undefined {
    if (events.length === 0) { return undefined }
    const location = firstEventsLocation(events)
    return location ? {
        type: GroupType.Trip,
        location,
        phases: createPhasesWithEvents(events),
        events,
    } : undefined
}

export function createTransportGroup(events: Event[]): TransportGroup | undefined {
    if (events.length === 0) { return undefined }
    const location = firstEventsLocation(events)
    return location ? {
        type: GroupType.Transport,
        location,
        phases: createPhasesWithEvents(events),
        events,
    } : undefined
}

export function createHomeGroup(events: Event[]): HomeGroup | undefined {
    if (events.length === 0) { return undefined }
    const location = firstEventsLocation(events)
    return location ? {
        type: GroupType.Home,
        location,
        events,
    } : undefined
}

const DISTANT_PAST = '1920-01-01'
const DISTANT_FUTURE = '2055-01-01'
function getHomeForDate(date: Moment, homes: Home[] = []) {
    return homes.find(home => {
        if (!home) return false
        const since = moment(home?.since as MomentInput || DISTANT_PAST)
        const until = moment(home?.until as MomentInput || DISTANT_FUTURE)
        return date.isAfter(since) && date.isBefore(until)
    })
}

interface Context {
    homes: Home[]
}
class TimelineGroupsFactory {
    stack: Stack
    context: Context
    groups: Group[]

    constructor(stack: Stack, context: Context) {
        this.stack = stack
        this.context = context
        this.groups = []
    }
    getCurrentEvent() {
        return this.stack.getCurrent()
    }
    getCurrentHome() {
        const currentEvent = this.getCurrentEvent()
        const currentDate = getEventDate(currentEvent)
        return getHomeForDate(currentDate, this.context.homes)
    }
    isCurrentEventAtHome() {
        const currentHome = this.getCurrentHome()
        const currentEvent = this.getCurrentEvent()
        if (currentEvent.type === EventType.Transport) {
            return false
        }
        return currentHome ? isTheSameArea(currentHome.location, currentEvent.location) : false
    }

    push(group: Group | undefined) {
        if (group) {
            this.groups.unshift(group)
        }
    }

    process() {
        this.stack.makeStep()
        while(!this.stack.isFinished()) {
            this.processNext()
        }
    }

    processNext() {
        const isAtHome = this.isCurrentEventAtHome()
        const events: Event[] = []
        if (isAtHome) {
            while(!this.stack.isFinished() && this.isCurrentEventAtHome()) {
                events.unshift(this.getCurrentEvent())
                this.stack.makeStep()
            }
            this.push(createHomeGroup(events))
        } else {
            while(!this.stack.isFinished() && !this.isCurrentEventAtHome()) {
                events.unshift(this.getCurrentEvent())
                this.stack.makeStep()
            }
            if (events.length > 0) {
                const isTransportOnly = events.reduce((acc, e: Event) => acc && e.type === EventType.Transport, true)
                if (isTransportOnly) {
                    this.push(createTransportGroup(events))
                } else {
                    this.push(createMultihopGroup(events))
                }
            }
        }
    }

    get(): Group[] {
        return this.groups.filter(Boolean)
    }
}

export function createTimelineGroups(events: Event[] = [], context: Context = {homes: []}): Group[] {
    const eventsStack = new Stack(events)
    const timelineGroupsFactory = new TimelineGroupsFactory(eventsStack, context)
    timelineGroupsFactory.process()
    return timelineGroupsFactory.get()
}
