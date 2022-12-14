import { getTransportType, TRANSPORT_TYPE } from '../../swarm/categories'
import { getCheckinDate, getDistanceBetweenCheckins, getCheckinLocation, ensureDateString } from '../../swarm/functions'
import { Home, isTheSameArea } from '../../location'
import Stack from './stack'
import moment from 'moment'

import { Event, EventType, TransportMode, CheckinEvent, TransportEvent, CalendarDayType, CalendarEvent, NewYearCalendarEvent, NewHomeCalendarEvent } from './types'
import type { Context } from './types'
import type { Checkin } from "../../swarm/functions"
import type { Location } from '../../location'
import type { Moment, MomentInput } from "moment"
import { getHomeForDate } from "./context"

export function createNewYearCalendarEvent(date: String | Moment): NewYearCalendarEvent {
    return {
        type: EventType.Calendar,
        dayType: CalendarDayType.NewYear,
        date: ensureDateString(date),
    }
}

export function createNewHomeCalendarEvent(date: String | Moment, from: Home, to: Home): NewHomeCalendarEvent {
    return {
        type: EventType.Calendar,
        dayType: CalendarDayType.NewHome,
        date: ensureDateString(date, 'YYYY-MM-DD'),
        from,
        to,
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

export function createTransportEvent(mode: TransportMode, date: String | Moment, from: Location, to: Location, guess: Boolean = false): TransportEvent {
    return { type: EventType.Transport, mode, date: ensureDateString(date), from, to, guess }
}

export function getEventDate(event: Event): Moment {
    return moment(event.date as MomentInput)
}

const FLIGHT_DISTANCE_GUESS = 800
const NON_FLIGHT_DISTANCE_GUESS = 150
const BUS_DISTANCE_GUESS = 40

class TimelineEventsFactory {
    stack: Stack<Checkin>
    events: Event[]
    context: Context

    constructor(stack: Stack<Checkin>, context: Context) {
        this.stack = stack
        this.events = []
        this.context = context
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
        const maybePrevious = this.stack.getPrevious()
        const maybeCurrent = this.stack.getCurrent()
        if (!maybeCurrent) { return }
        const current = maybeCurrent!
        
        // First event is always added
        if (!maybePrevious) {
            return this.push(createCheckinEvent(current))
        }
        const previous = maybePrevious!

        // Check if any calendar events between checkins
        const previousMoment = getCheckinDate(previous)
        const currentMoment = getCheckinDate(current)

        // NEW YEAR calendar event
        const previousYear = previousMoment.get('year')
        const currentYear = currentMoment.get('year')
        if (previousYear !== currentYear) {
            const yearDifference = currentYear - previousYear
            const years = Array(yearDifference).fill(previousYear).map((year, index) => year + index + 1)
            const newYearEvents = years.map(year => createNewYearCalendarEvent(moment(`${year}-01-01T00:00:00`)))
            newYearEvents.forEach(event => this.push(event))
            console.log(JSON.stringify(newYearEvents))
        }

        // NEW HOME calendar event
        const previousHome = getHomeForDate(previousMoment, this.context.homes)
        const currentHome = getHomeForDate(currentMoment, this.context.homes)
        if (currentHome && previousHome && previousHome !== currentHome) {
            this.push(createNewHomeCalendarEvent(currentHome.since!, previousHome!, currentHome!))
        }

        if (!isTheSameArea(getCheckinLocation(current), getCheckinLocation(previous))) {
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

export function createTimelineEvents(checkins: Checkin[] = [], context: Context = {homes: []}) {
    const checkinsStack = new Stack<Checkin>(checkins)
    const timelineEventsFactory = new TimelineEventsFactory(checkinsStack, context)
    timelineEventsFactory.process()
    return timelineEventsFactory.get()
}
