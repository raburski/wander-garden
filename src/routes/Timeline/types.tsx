import type { Location } from '../../location'
import type { Checkin } from '../../swarm'

/* EVENTS */

export enum EventType {
    Checkin = 'CHECKIN',
    Transport = 'TRANSPORT',
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

export interface Event {
    type: EventType
    date: String
    guess?: Boolean
}

export interface CheckinEvent extends Event {
    type: EventType.Checkin
    location: Location
    checkin: Checkin
}

export interface TransportEvent extends Event {
    type: EventType.Transport
    mode: TransportMode
    from: Location
    to: Location
}

/* GROUPS */

export enum GroupType {
    Container = 'CONTAINER',
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
    locations: Location[]
    groups: Group[]
}

export interface HomeGroup extends Group {
    location: Location
    events: Event[]
}

export interface TransportGroup extends Group {
    location: Location
    events: Event[]
    phases: Event[]
}

export interface TripGroup extends Group {
    locations: Location[]
    events: Event[]
    phases: Event[]
}


export default {}