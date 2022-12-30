import type { Location, Home } from '../../domain/location'
import type { Checkin } from '../../domain/swarm'

/* EVENTS */

export enum EventType {
    Checkin = 'CHECKIN',
    Transport = 'TRANSPORT',
    Calendar = 'CALENDAR'
}

export enum TransportMode {
    Unknown = 'UNKNOWN',
    Plane = 'PLANE',
    Car = 'CAR',
    Bus = 'BUS',
    Train = 'TRAIN',
    Ship = 'SHIP',
    Motobike = 'MOTOBIKE',
    Bicycle = 'BICYCLE',
    Foot = 'FOOT',
    Campervan = 'CAMPERVAN',
}

export enum LocationHighlightType {
    Country = 'COUNTRY',
    State = 'STATE',
    City = 'CITY',
}

export interface LocationHighlight {
    type: LocationHighlightType
    location: Location
}

export interface Event {
    type: EventType
    date: String
    guess?: Boolean
}

export interface CheckinEvent extends Event {
    type: EventType.Checkin
    location: Location
    checkin?: Checkin
}

export interface TransportEvent extends Event {
    type: EventType.Transport
    mode: TransportMode
    from: Location
    to: Location
}

export enum CalendarDayType {
    NewYear = 'NEW_YEAR',
    NewHome = 'NEW_HOME',
}

export interface CalendarEvent extends Event {
    type: EventType.Calendar
    dayType: CalendarDayType
}

export interface NewYearCalendarEvent extends CalendarEvent {
    dayType: CalendarDayType.NewYear
}

export interface NewHomeCalendarEvent extends CalendarEvent {
    dayType: CalendarDayType.NewHome
    from: Home
    to: Home
}

/* GROUPS */

export enum GroupType {
    Container = 'CONTAINER',
    Plain = 'PLAIN',
    Home = 'HOME',
    Transport = 'TRANSPORT',
    Trip = 'TRIP',
}

export interface Group {
    type: GroupType
    since: String
    until: String
}

export interface ContainerGroup extends Group {
    highlights: LocationHighlight[]
    groups: Group[]
}

export interface PlainGroup extends Group {
    events: Event[]
}

export interface HomeGroup extends Group {
    highlight: LocationHighlight
    events: Event[]
}

export interface TransportGroup extends Group {
    highlight: LocationHighlight
    events: Event[]
    phases: Event[]
}

export interface TripGroup extends Group {
    highlights: LocationHighlight[]
    events: Event[]
    phases: Event[]
}

export interface Context {
    homes: Home[]
}

export default {}