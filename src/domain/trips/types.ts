import { Location } from "domain/location"
import { Stay } from "domain/stays"
import { Checkin } from "domain/swarm"

export enum LocationHighlightType {
    Country = 'COUNTRY',
    State = 'STATE',
    City = 'CITY',
}

export interface LocationHighlight {
    type: LocationHighlightType
    location: Location
}

export interface TripPhase {
    since: string,
    until: string,
    stay?: Stay,
    checkins: Checkin[],
}

export interface Trip { 
    id: string,
    since: string,
    until: string,
    highlights: LocationHighlight[],
    phases: TripPhase[],
}

export {}