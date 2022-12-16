import { getTransportType, TRANSPORT_TYPE } from '../../swarm/categories'
import { getCheckinDate, getDistanceBetweenCheckins, getCheckinLocation, ensureDateString } from '../../swarm/functions'
import { Home, isTheSameArea } from '../../location'
import Stack from './stack'
import moment from 'moment'

import { Event, EventType, TransportMode, CheckinEvent, TransportEvent, CalendarDayType, CalendarEvent, NewYearCalendarEvent, NewHomeCalendarEvent } from './types'
import type { Context } from './types'
import type { Checkin } from "../../swarm"
import type { Location } from '../../location'
import type { Moment, MomentInput } from "moment"
import { getHomeForDate } from "./context"
import arrayQueryReplace, { some, any, start, end } from './arrayQueryReplace'

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

export function createCheckinEvent(checkin: Checkin, guess?: boolean): CheckinEvent  {
    const { type, ...checkinNonType } = checkin
    return {
        type: EventType.Checkin, 
        location: getCheckinLocation(checkin),
        date: getCheckinDate(checkin).format(),
        checkin: checkinNonType,
        guess,
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

export function createHomeCheckinEvent(beforeDate: String, afterDate: String, context: Context): CheckinEvent | undefined {
    const beforeMoment = moment(beforeDate as MomentInput)
    const afterMoment = moment(afterDate as MomentInput)
    const differenceInHours = beforeMoment.diff(afterMoment, 'hours')
    const dateBetween = moment(beforeMoment)
    dateBetween.add(differenceInHours, 'hours')
    const home = getHomeForDate(dateBetween, context.homes)
    if (!home) { return undefined }

    return {
        type: EventType.Checkin, 
        location: home!.location,
        date: dateBetween.format(),
        guess: true,
    }
}

type EventQueryContext = { event: Event }
type EventsQueryContext = { events: Event[] }

export const DAYS_INACTIVE_UNTIL_GUESS_HOME = 7
function createHomeCheckinEventsWhenLongInactivity(timelineContext: Context) {
    return {
        pattern: [
            (e: Event) => e.type === EventType.Checkin,
            any((e: Event) => e.type !== EventType.Checkin),
            (current: Event, events: [CheckinEvent], context: EventQueryContext) => {
                if (current.type !== EventType.Checkin) { return false }
                const previous = events[events.length - 1]
                const previousMoment = moment(previous.date as MomentInput)
                const currentMoment = moment(current.date as MomentInput)
                if (previousMoment.diff(currentMoment, 'days') <= DAYS_INACTIVE_UNTIL_GUESS_HOME) {
                    return false
                }
                const homeCheckin = createHomeCheckinEvent(previous.date, current.date, timelineContext)
                if (!homeCheckin) {
                    return false
                }
                context.event = homeCheckin!
                return true
            }
        ],
        result: (events: Event[], context: EventQueryContext) => [
            ...events.slice(0, events.length - 1),
            context.event,
            events[events.length - 1],
        ].filter(Boolean)
    }
}

const createNewYearCalendarEvents = () => ({
    pattern: [
        (event: Event) => event,
        (olderEvent: Event, [newerEvent]: [Event], context: EventsQueryContext) => {
            const previousYear = moment(olderEvent.date as MomentInput).get('year')
            const currentYear = moment(newerEvent.date as MomentInput).get('year')
            if (previousYear !== currentYear) {
                const yearDifference = currentYear - previousYear
                if (yearDifference < 0) {
                    return false // TODO: INVESTIGATE!
                    console.log(newerEvent, olderEvent)
                }
                const years = Array(yearDifference).fill(previousYear).map((year, index) => year + index + 1)
                context.events = years.map(year => createNewYearCalendarEvent(moment(`${year}-01-01T00:00:00`)))
                return true
            }
            return false
        }
    ],
    result: ([event1, event2]: [Event, Event], context: EventsQueryContext): Event[] => 
        [event1, ...context.events, event2]
})

const createNewHomeCalendarEvents = (timelineContext: Context) => ({
    pattern: [
        (event: Event) => event,
        (previousEvent: Event, [currentEvent]: [Event], context: EventQueryContext) => {
            const previousMoment = moment(previousEvent.date as MomentInput)
            const currentMoment = moment(currentEvent.date as MomentInput)
            const previousHome = getHomeForDate(previousMoment, timelineContext.homes)
            const currentHome = getHomeForDate(currentMoment, timelineContext.homes)
            if (currentHome && previousHome && previousHome !== currentHome) {
                context.event = createNewHomeCalendarEvent(currentHome!.since!, previousHome!, currentHome!)
                return true
            }
            return false
        },
    ],
    result: ([currentEvent, previousEvent]: [Event, Event], context: EventQueryContext): Event[] => 
        [currentEvent, context.event, previousEvent]
})

export function createTimelineEvents(checkins: Checkin[] = [], context: Context = {homes: []}) {
    const checkinsStack = new Stack<Checkin>(checkins)
    const timelineEventsFactory = new TimelineEventsFactory(checkinsStack, context)
    timelineEventsFactory.process()
    return arrayQueryReplace([
        createHomeCheckinEventsWhenLongInactivity(context),
        createNewYearCalendarEvents(),
        createNewHomeCalendarEvents(context),
    ], timelineEventsFactory.get())
}
