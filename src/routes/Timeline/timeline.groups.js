import moment from 'moment'
import Stack from './stack'
import { isEqualLocationCity, isEqualApproximiteLocation } from '../../location'
import { checkinHasCategory } from '../../swarm/categories'
import { getEventDate, EVENT_TYPE, TRANSPORT_MODE, createTransportEvent } from './timeline.events'
import arrayQueryReplace, { some, any, start, end } from './arrayQueryReplace'

export const GROUP_TYPE = {
    HOME: 'HOME',
    MULTIHOP_TRIP: 'MULTIHOP_TRIP',
}

function firstEventsLocation(events) {
    const checkinEvents = events.filter(e => e.type === EVENT_TYPE.CHECKIN)
    const eventWithCity = checkinEvents.find(e => e?.location?.city)
    if (eventWithCity) {
        return eventWithCity.location
    }
    return checkinEvents[0].location   
}

export function isTheSameArea(leftLocation, rightLocation) {
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
        e => e.type === EVENT_TYPE.TRANSPORT && e.mode === TRANSPORT_MODE.CAR,
        some(e => e.type === EVENT_TYPE.CHECKIN && checkinHasCategory(e.checkin, MOP_CATEGORIES)),
        e => e.type === EVENT_TYPE.TRANSPORT && e.mode === TRANSPORT_MODE.CAR,
    ],
    result: ([to, _, from]) =>
        createTransportEvent(from.mode, from.date, from.from, to.to, true)
}

const TRAIN_CLOSURE_FROM = {
    pattern: [
        start(e => e.type === EVENT_TYPE.TRANSPORT && e.mode === TRANSPORT_MODE.TRAIN),
        some(e => e.type === EVENT_TYPE.CHECKIN),
        end(e => e.type === EVENT_TYPE.TRANSPORT && e.mode !== TRANSPORT_MODE.TRAIN && e.guess === true),
    ],
    result: events => {
        const train = events[0]
        const otherTransport = events[events.length - 1]
        return [train, ...events.slice(1, -1), createTransportEvent(TRANSPORT_MODE.TRAIN, otherTransport.date, otherTransport.from, otherTransport.to, otherTransport.guess)]
    }
}

const TRAIN_CLOSURE_TO = {
    pattern: [
        start(e => e.type === EVENT_TYPE.TRANSPORT && e.mode !== TRANSPORT_MODE.TRAIN && e.guess === true),
        some(e => e.type === EVENT_TYPE.CHECKIN),
        end(e => e.type === EVENT_TYPE.TRANSPORT && e.mode === TRANSPORT_MODE.TRAIN),
    ],
    result: events => {
        const train = events[events.length - 1]
        const otherTransport = events[0]
        return [createTransportEvent(TRANSPORT_MODE.TRAIN, otherTransport.date, otherTransport.from, otherTransport.to, otherTransport.guess), ...events.slice(1, -1), train]
    }
}

export function createPhasesWithEvents(events) {
    let currentEvent = null
    const _events = arrayQueryReplace([
        MOP_INCLUDE_IN_TRIP,
        TRAIN_CLOSURE_FROM,
        TRAIN_CLOSURE_TO,
    ], events)
    const phases = []
    for (let i = _events.length - 1; i >= 0; i--) {
        const event = _events[i]
        if (event.type === EVENT_TYPE.TRANSPORT) {
            if (currentEvent) {
                phases.unshift(currentEvent)
                currentEvent = null
            }
            phases.unshift(event)
        } else {
            if (!currentEvent) {
                if (event.location?.city) {
                    currentEvent = event
                }
            } else {
                if (isTheSameArea(currentEvent.location, event.location)) {
                    if (!currentEvent.location?.city && event.location?.city) {
                        currentEvent = event
                    }
                } else {
                    if (event.location?.city) {
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

export function createMultihopGroup(events) {
    return {
        type: GROUP_TYPE.MULTIHOP_TRIP,
        location: firstEventsLocation(events),
        phases: createPhasesWithEvents(events),
        events,
    }
}

export function createHomeGroup(events = []) {
    return {
        type: GROUP_TYPE.HOME,
        location: firstEventsLocation(events),
        events,
    }
}

const DISTANT_PAST = '1920-01-01'
const DISTANT_FUTURE = '2055-01-01'
function getHomeForDate(date, homes = []) {
    return homes.find(home => {
        const since = moment(home.since || DISTANT_PAST)
        const until = moment(home.until || DISTANT_FUTURE)
        return date.isAfter(since) && date.isBefore(until)
    })
}

class TimelineGroupsFactory {
    constructor(stack, context) {
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
        if (currentEvent.type === EVENT_TYPE.TRANSPORT) {
            return false
        }
        return currentHome ? isTheSameArea(currentHome.location, currentEvent.location) : false
    }

    push(group) {
        this.groups.unshift(group)
    }

    process() {
        this.stack.makeStep()
        while(!this.stack.isFinished()) {
            this.processNext()
        }
    }

    processNext() {
        const isAtHome = this.isCurrentEventAtHome()
        const events = []
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
            this.push(createMultihopGroup(events))
        }
    }

    get() {
        return this.groups
    }
}

export function createTimelineGroups(events = [], context = {}) {
    const eventsStack = new Stack(events)
    const timelineGroupsFactory = new TimelineGroupsFactory(eventsStack, context)
    timelineGroupsFactory.process()
    return timelineGroupsFactory.get()
}
