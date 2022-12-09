import type { Location } from '../../location'
import type { Checkin } from '../../swarm'

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

export enum GroupType {
    Home = 'HOME',
    Transport = 'TRANSPORT',
    Trip = 'TRIP',
}

export interface Event {
    type: EventType
    date: String
}

export interface CheckinEvent extends Event {
    type: EventType.Checkin
    checkin: Checkin
}

export interface TransportEvent extends Event {
    type: EventType.Transport
    mode: TransportMode
    from: Location
    to: Location
}



export default {}