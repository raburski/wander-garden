import { Flight } from "domain/flights/types"
import { Location } from "domain/location"
import { Stay } from "domain/stays"
import { Checkin } from "domain/swarm"
import { Tour } from "domain/tours/types"

export enum LocationHighlightType {
    Country = 'COUNTRY',
    State = 'STATE',
    City = 'CITY',
}

export interface LocationHighlight {
    type: LocationHighlightType
    location: Location
}

export enum TripPhaseEventType {
    Checkin = 'CHECKIN',
    Tour = 'TOUR',
}

export interface TripPhaseEvent {
    type: TripPhaseEventType,
    checkin?: Checkin,
    tour?: Tour,
}

export interface TripPhase {
    since: string,
    until: string,
    stay?: Stay,
    events: TripPhaseEvent[],
    arriveBy?: Flight[],
}

export interface Trip { 
    id: string,
    since: string,
    until: string,
    highlights: LocationHighlight[],
    phases: TripPhase[],
}

export {}