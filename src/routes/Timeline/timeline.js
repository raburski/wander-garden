import { getTransportType, TRANSPORT_TYPE } from '../../swarm/categories'
import { hasCity, isEqualCity, getDistanceBetweenCheckins, getCheckinLocation } from '../../location'
export { getCheckinLocation } from '../../location' 

const EVENT_TYPE = {
    CHECKIN: 'CHECKIN',
    TRANSPORT: 'TRANSPORT',
}

export const TRANSPORT_MODE = {
    UNKNOWN: 'UNKNOWN',
    PLANE: 'PLANE',
    CAR: 'CAR',
    BUS: 'BUS',
    TRAIN: 'TRAIN',
    SHIP: 'SHIP',
    MOTOBIKE: 'MOTOBIKE',
    BICYCLE: 'BICYCLE',
    FOOT: 'FOOT',
}

export function createCheckinEvent({ type, ...checkin }) {
    return { type: EVENT_TYPE.CHECKIN, ...checkin }
}

export function createTransportEvent(mode, from, to, guess = false) {
    return { type: EVENT_TYPE.TRANSPORT, mode, from, to, guess }
}



class Stack {
    constructor(items = []) {
        this.items = items
        this.currentIndex = items.length
    }
    isFinished() {
        return this.currentIndex < 0
    }
    makeStep() {
        this.currentIndex = this.currentIndex - 1
        return !this.isFinished()
    }

    getCurrent() {
        return this.items[this.currentIndex]
    }
    getNext() {
        const nextIndex = this.currentIndex - 1
        return nextIndex < 0 ? null : this.items[nextIndex]
    }
    getPrevious() {
        const previousIndex = this.currentIndex + 1
        return previousIndex >= this.items.length ? null : this.items[previousIndex]
    }
}

const FLIGHT_DISTANCE_GUESS = 800
const NON_FLIGHT_DISTANCE_GUESS = 150
const BUS_DISTANCE_GUESS = 40

class TimelineEventsFactory {
    constructor(stack) {
        this.stack = stack
        this.events = []
    }
    push(event) {
        this.events.unshift(event)
    }

    process() {
        while(this.stack.makeStep()) {
            this.processNext()
        }
    }

    processNext() {
        const previous = this.stack.getPrevious()
        const current = this.stack.getCurrent()
        
        // First event is always added
        if (!previous) {
            return this.push(createCheckinEvent(current))
        }
        if (hasCity(current) && hasCity(previous) && !isEqualCity(previous, current)) {
            const previousTransportType = getTransportType(previous)
            const currentTransportType = getTransportType(current)
            const distance = getDistanceBetweenCheckins(previous, current)
            const transportType = previousTransportType || currentTransportType
            const isTransportTypeConflicting = previousTransportType && currentTransportType && previousTransportType !== currentTransportType

            if (transportType && !isTransportTypeConflicting) {
                switch (transportType) {
                    case TRANSPORT_TYPE.PLANE:
                        if (distance > NON_FLIGHT_DISTANCE_GUESS) {
                            this.push(createTransportEvent(TRANSPORT_MODE.PLANE, getCheckinLocation(previous), getCheckinLocation(current)))
                        } else if (distance < BUS_DISTANCE_GUESS) {
                            this.push(createTransportEvent(TRANSPORT_MODE.BUS, getCheckinLocation(previous), getCheckinLocation(current), true))
                        }
                        break
                    case TRANSPORT_TYPE.TRAIN:
                        this.push(createTransportEvent(TRANSPORT_MODE.TRAIN, getCheckinLocation(previous), getCheckinLocation(current)))
                        break
                }
            } else if (isTransportTypeConflicting) {
                // TODO: deal with airport -> train or bus -> train mixes
            } else {
                // TODO check wether city has airport nearby
                if (distance >= FLIGHT_DISTANCE_GUESS) {
                    this.push(createTransportEvent(TRANSPORT_MODE.PLANE, getCheckinLocation(previous), getCheckinLocation(current), true))
                } else {
                    this.push(createTransportEvent(TRANSPORT_MODE.CAR, getCheckinLocation(previous), getCheckinLocation(current), true))
                }
            }
        }
        this.push(createCheckinEvent(current))
    }

    get() {
        return this.events
    }
}

export function createTimelineEvents(checkins = []) {
    const checkinsStack = new Stack(checkins)
    const timelineEventsFactory = new TimelineEventsFactory(checkinsStack)
    timelineEventsFactory.process()
    return timelineEventsFactory.get()
}

export function createTimelineGroups(events = []) {
    const eventsStack = new Stack(events)
    const timelineGroupsFactory = new TimelineGroupsFactory(eventsStack)
    timelineGroupsFactory.process()
    return timelineGroupsFactory.get()
}

export default function createTimeline(checkins) {
    return createTimelineGroups(createTimelineEvents(checkins))
}