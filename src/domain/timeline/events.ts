import { getTransportType, TRANSPORT_TYPE } from 'domain/swarm/categories'
import { getCheckinDate, getDistanceBetweenCheckins, getCheckinLocation, ensureDateString, isEqualCountry } from 'domain/swarm/functions'
import { Home, isEqualLocationCountry, isTheSameArea } from 'domain/location'
import Stack from 'domain/stack'
import moment from 'moment'

import { Event, EventType, TransportMode, CheckinEvent, TransportEvent, CalendarDayType, CalendarEvent, NewYearCalendarEvent, NewHomeCalendarEvent } from './types'
import type { Context } from './types'
import type { Checkin } from "domain/swarm"
import type { Location } from 'domain/location'
import type { Moment, MomentInput } from "moment"
import { getHomeForDate, isCheckinAtHome } from "./functions"
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

export function createHomeCheckin(beforeDate: String, afterDate: String, context: Context): Checkin | undefined {
    const beforeMoment = moment(beforeDate as MomentInput)
    const afterMoment = moment(afterDate as MomentInput)
    const differenceInHours = beforeMoment.diff(afterMoment, 'hours')
    const dateBetween = moment(beforeMoment)
    dateBetween.add(differenceInHours, 'hours')
    const home = getHomeForDate(dateBetween, context.homes)
    if (!home) { return undefined }

    return {
        venue: {
            categories: [],
            location: home!.location
        },
        createdAt: dateBetween.unix(),
    }
}

type EventQueryContext = { event: Event }
type EventsQueryContext = { events: Event[] }

type CheckinQueryContext = { checkin: Checkin }

export const DAYS_INACTIVE_UNTIL_GUESS_HOME = 7
function createHomeCheckinWhenLongInactivity(timelineContext: Context) {
    return {
        pattern: [
            (e: Checkin) => true,
            (current: Checkin, checkins: [Checkin], context: CheckinQueryContext) => {
                const newerCheckin = checkins[0]
                const newerCheckinMoment = moment.unix(newerCheckin.createdAt)
                const currentMoment = moment.unix(current.createdAt)
                const numberOfDaysInactive = newerCheckinMoment.diff(currentMoment, 'days')
                if (numberOfDaysInactive <= DAYS_INACTIVE_UNTIL_GUESS_HOME) {
                    return false
                }

                const homeCheckin = createHomeCheckin(currentMoment.format(), newerCheckinMoment.format(), timelineContext)
                if (!homeCheckin) { return false }
                context.checkin = homeCheckin!
                return true
            },
        ],
        result: (checkins: [Checkin, Checkin], context: CheckinQueryContext) => [
            checkins[0],
            context.checkin,
            checkins[1]
        ]
    }
}

const DAYS_INACTIVE_UNTIL_GUESS_HOME_AFTER_TRIP = 2
function createHomeCheckinAfterFlyingBackHome(timelineContext: Context) {
    return {
        pattern: [
            // NOT HOME LOCATION
            // [X days without checkin]
            // HOME COUNTRY LOCATION
            // any(HOME COUNTRY LOCATION)
            // FOREIGN LOCATION
            (checkin: Checkin) => {
                return !isCheckinAtHome(checkin)
            },
            some((current: Checkin, checkins: [Checkin]) => {
                const home = getHomeForDate(getCheckinDate(current), timelineContext.homes)
                const isInHomeCountry = home && isEqualLocationCountry(getCheckinLocation(current), home.location)
                const isAtHome = isCheckinAtHome(current)

                const newerCheckin = checkins[0]
                const newerCheckinMoment = getCheckinDate(newerCheckin)
                const currentMoment = getCheckinDate(current)
                const numberOfDaysInactive = newerCheckinMoment.diff(currentMoment, 'days')
                const isPeriodWithoutCheckin = numberOfDaysInactive >= DAYS_INACTIVE_UNTIL_GUESS_HOME_AFTER_TRIP
                return !isAtHome && isInHomeCountry && isPeriodWithoutCheckin
            }),
            (current: Checkin, checkins: [Checkin], context: CheckinQueryContext) => {
                const home = getHomeForDate(getCheckinDate(current), timelineContext.homes)
                return home ? !isEqualLocationCountry(getCheckinLocation(current), home.location) : false
            },
        ],
        result: (checkins: Checkin[], context: CheckinQueryContext) => {
            const notHomeCheckin = checkins[0]
            const homeCountryCheckins = checkins.slice(1, -1)
            const foreignCheckin = checkins[checkins.length - 1]

            const homeCheckin = createHomeCheckin(getCheckinDate(homeCountryCheckins[0]).format(), getCheckinDate(notHomeCheckin).format(), timelineContext)
            return [
                notHomeCheckin,
                homeCheckin,
                ...homeCountryCheckins,
                foreignCheckin,
            ]
        }
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
    const enhancedCheckins = arrayQueryReplace([
        createHomeCheckinWhenLongInactivity(context),
        createHomeCheckinAfterFlyingBackHome(context),
    ], checkins)
    const checkinsStack = new Stack<Checkin>(enhancedCheckins)
    const timelineEventsFactory = new TimelineEventsFactory(checkinsStack, context)
    timelineEventsFactory.process()
    return arrayQueryReplace([
        createNewYearCalendarEvents(),
        createNewHomeCalendarEvents(context),
    ], timelineEventsFactory.get())
}
