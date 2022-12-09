import { getTransportType, TRANSPORT_TYPE } from '../../swarm/categories'
import { getCheckinDate, getDistanceBetweenCheckins, getCheckinLocation } from '../../swarm/functions'
import { isTheSameArea } from './timeline.groups'
import Stack from './stack'
import moment from 'moment'

import { Event, EventType, TransportMode, CheckinEvent, TransportEvent } from './types'
import type { Checkin, Date, Location } from "../../swarm/functions"

export function createCheckinEvent(checkin: Checkin): CheckinEvent  {
    const { type, ...checkinNonType } = checkin
    return {
        type: EventType.Checkin, 
        location: getCheckinLocation(checkin),
        date: getCheckinDate(checkin).format(),
        checkin: checkinNonType
    }
}

export function createTransportEvent(mode: TransportMode, date: Date, from: Location, to: Location, guess: boolean = false): TransportEvent {
    return { type: EventType.Transport, mode, date: typeof date === "string" ? date : date.format(), from, to, guess }
}

export function getEventDate(event: Event): Date {
    return typeof event.date === "string" ? moment(event.date) : event.date
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
        if (!isTheSameArea(getCheckinLocation(current), getCheckinLocation(previous))) {
        // if (hasCity(current) && hasCity(previous) && !isEqualCity(previous, current)) {
            const previousTransportType = getTransportType(previous)
            const currentTransportType = getTransportType(current)
            const distance = getDistanceBetweenCheckins(previous, current)

            const transportType = previousTransportType || currentTransportType
            const transportCheckin = currentTransportType ? current : previous
            const isTransportTypeConflicting = previousTransportType && currentTransportType && previousTransportType !== currentTransportType

            if (transportType && !isTransportTypeConflicting) {
                // console.log('transportType', getCheckinLocation(previous), getCheckinLocation(current), distance)
                switch (transportType) {
                    case TRANSPORT_TYPE.PLANE:
                        if (distance > NON_FLIGHT_DISTANCE_GUESS) {
                            this.push(createTransportEvent(TRANSPORT_MODE.PLANE, getCheckinDate(transportCheckin), getCheckinLocation(previous), getCheckinLocation(current)))
                        } else if (distance < BUS_DISTANCE_GUESS) {
                            this.push(createTransportEvent(TRANSPORT_MODE.BUS, getCheckinDate(transportCheckin), getCheckinLocation(previous), getCheckinLocation(current), true))
                        }
                        break
                    case TRANSPORT_TYPE.TRAIN:
                        this.push(createTransportEvent(TRANSPORT_MODE.TRAIN, getCheckinDate(transportCheckin), getCheckinLocation(previous), getCheckinLocation(current)))
                        break
                    case TRANSPORT_TYPE.CAR:
                        this.push(createTransportEvent(TRANSPORT_MODE.CAR, getCheckinDate(transportCheckin), getCheckinLocation(previous), getCheckinLocation(current)))
                        break
                }
            } else if (isTransportTypeConflicting) {
                // TODO: deal with airport -> train or bus -> train mixes
                // console.log('conflicting', getCheckinLocation(previous), getCheckinLocation(current), distance)
            } else {
                // console.log('no transport type', getCheckinLocation(previous), getCheckinLocation(current), distance)
                // TODO check wether city has airport nearby
                if (distance >= FLIGHT_DISTANCE_GUESS) {
                    // TODO: extrapolate date
                    this.push(createTransportEvent(TRANSPORT_MODE.PLANE, getCheckinDate(current), getCheckinLocation(previous), getCheckinLocation(current), true))
                } else {
                    this.push(createTransportEvent(TRANSPORT_MODE.CAR, getCheckinDate(current), getCheckinLocation(previous), getCheckinLocation(current), true))
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
