import { EventType } from "./types"
import moment from "moment"
import { isTheSameArea } from 'domain/location'
import type { Context, Event, CalendarEvent, CheckinEvent, TransportEvent } from "./types"
import type { Home } from "domain/location"
import type { Moment, MomentInput } from "moment"
import { Checkin, getCheckinDate, getCheckinLocation } from "domain/swarm"

function ensureDateMoment(date: Moment | string): Moment {
    return typeof date === 'string' ? moment(date as MomentInput) : date! as Moment
}

const DISTANT_PAST = '1920-01-01'
const DISTANT_FUTURE = '2055-01-01'
export function getHomeForDate(date: Moment | string, homes: Home[]): Home | undefined {
    const ensuredDate = ensureDateMoment(date)
    return homes.find(home => {
        if (!home) return false
        const since = moment(home?.since as MomentInput || DISTANT_PAST)
        const until = moment(home?.until as MomentInput || DISTANT_FUTURE)
        return ensuredDate.isAfter(since) && ensuredDate.isBefore(until)
    })
}

export function isCheckinAtHome(checkin: Checkin, homes: Home[]): boolean {
    const home = getHomeForDate(getCheckinDate(checkin), homes)
    return home ? isTheSameArea(home.location, getCheckinLocation(checkin)) : false
}

export function getHomeForEvent(event?: Event, context?: Context): Home | undefined {
    if (!event || !context) { return undefined }
    switch (event.type) {
        case EventType.Calendar:
            return getHomeForDate((event as CalendarEvent).date, context.homes)
        case EventType.Checkin:
            return getHomeForDate((event as CheckinEvent).date, context.homes)
        case EventType.Transport:
            return getHomeForDate((event as TransportEvent).date, context.homes)
        default:
            return undefined
    }
}

export function isEventAtHome(event?: Event, home?: Home): boolean {
    if (!event || !home) {
        return false
    }
    switch (event.type) {
        case EventType.Calendar:
            return false
        case EventType.Checkin:
            return isTheSameArea(home.location, (event as CheckinEvent).location)
        case EventType.Transport:
            return isTheSameArea(home.location, (event as TransportEvent).from) && isTheSameArea(home.location, (event as TransportEvent).to)
        default:
            return false
    }
}