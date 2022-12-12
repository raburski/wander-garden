import { getTransportType, TRANSPORT_TYPE } from '../../swarm/categories'
import { getCheckinDate, getDistanceBetweenCheckins, getCheckinLocation, ensureDateString } from '../../swarm/functions'
import { isTheSameArea } from './timeline.groups'
import Stack from './stack'
import moment from 'moment'

import { Event, EventType, TransportMode, CheckinEvent, TransportEvent, CalendarDayType, CalendarEvent } from './types'
import type { Checkin, Date, Location } from "../../swarm/functions"
import type { Moment, MomentInput } from "moment"

export function createCalendarEvent(date: Date, type: CalendarDayType, name?: String): CalendarEvent {
    return {
        type: EventType.Calendar,
        date: ensureDateString(date),
        dayType: type,
        name,
    }
}

export function createCheckinEvent(checkin: Checkin): CheckinEvent  {
    const { type, ...checkinNonType } = checkin
    return {
        type: EventType.Checkin, 
        location: getCheckinLocation(checkin),
        date: getCheckinDate(checkin).format(),
        checkin: checkinNonType
    }
}

export function createTransportEvent(mode: TransportMode, date: Date, from: Location, to: Location, guess: Boolean = false): TransportEvent {
    return { type: EventType.Transport, mode, date: ensureDateString(date), from, to, guess }
}

export function getEventDate(event: Event): Moment {
    return moment(event.date as MomentInput)
}

const FLIGHT_DISTANCE_GUESS = 800
const NON_FLIGHT_DISTANCE_GUESS = 150
const BUS_DISTANCE_GUESS = 40

class TimelineEventsFactory {
    stack: Stack
    events: Event[]

    constructor(stack: Stack) {
        this.stack = stack
        this.events = []
    }
    push(event: Event) {
        this.events.unshift(event)
    }

    process() {
        while(this.stack.makeStep()) {
            this.processNext()
        }
    }

    processNext() {
        const previous: Checkin = this.stack.getPrevious()
        const current: Checkin = this.stack.getCurrent()
        
        // First event is always added
        if (!previous) {
            return this.push(createCheckinEvent(current))
        }

        // Check if any calendar events between checkins
        const previousMoment = getCheckinDate(previous)
        const currentMoment = getCheckinDate(current)

        // NYE calendar event
        if (previousMoment.get('year') !== currentMoment.get('year')) {
            console.log(`NEW YEAR FOUND ${previousMoment.get('year')} -> ${currentMoment.get('year')}`)
            const newYearMoment = moment(`${currentMoment.get('year')}-01-01T00:00:00`)
            this.push(createCalendarEvent(newYearMoment, CalendarDayType.NewYear))
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
                switch (transportType) {
                    case TRANSPORT_TYPE.PLANE:
                        if (distance > NON_FLIGHT_DISTANCE_GUESS) {
                            this.push(createTransportEvent(TransportMode.Plane, getCheckinDate(transportCheckin), getCheckinLocation(previous), getCheckinLocation(current)))
                        } else if (distance < BUS_DISTANCE_GUESS) {
                            this.push(createTransportEvent(TransportMode.Bus, getCheckinDate(transportCheckin), getCheckinLocation(previous), getCheckinLocation(current), true))
                        }
                        break
                    case TRANSPORT_TYPE.TRAIN:
                        this.push(createTransportEvent(TransportMode.Train, getCheckinDate(transportCheckin), getCheckinLocation(previous), getCheckinLocation(current)))
                        break
                    case TRANSPORT_TYPE.CAR:
                        this.push(createTransportEvent(TransportMode.Car, getCheckinDate(transportCheckin), getCheckinLocation(previous), getCheckinLocation(current)))
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
                    this.push(createTransportEvent(TransportMode.Plane, getCheckinDate(current), getCheckinLocation(previous), getCheckinLocation(current), true))
                } else {
                    this.push(createTransportEvent(TransportMode.Car, getCheckinDate(current), getCheckinLocation(previous), getCheckinLocation(current), true))
                }
            }
        }
        this.push(createCheckinEvent(current))
    }

    get() {
        return this.events
    }
}

export function createTimelineEvents(checkins: Checkin[] = []) {
    const checkinsStack = new Stack(checkins)
    const timelineEventsFactory = new TimelineEventsFactory(checkinsStack)
    timelineEventsFactory.process()
    return timelineEventsFactory.get()
}
