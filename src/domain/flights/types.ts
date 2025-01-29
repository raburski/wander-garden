import { Origin } from "domain/extension"
import { Location } from "domain/location"
import { Money } from "type"
import equal from 'fast-deep-equal'

export enum FlightType {
    Travala = 'travala',
    MilesAndMore = 'milesAndMore',
    Ryanair = 'ryanair',
    Wizzair = 'wizzair',
}

export type AirportCode = string

export type FlightOperator = string

export interface FlightStage {
    airport: AirportCode,
    scheduled: string,
}

export interface Flight { 
    id: string,
    connectionId?: string,
    flightNo?: string,
    cabin?: string,
    operator: FlightOperator,
    departure: FlightStage,
    arrival: FlightStage,
    url?: string,
}

export interface FlightConnection {
    id: string,
    price?: Money,
}

export const OriginToFlightType = {
    [Origin.Travala]: FlightType.Travala,
    [Origin.MilesAndMore]: FlightType.MilesAndMore,
    [Origin.Ryanair]: FlightType.Ryanair,
    [Origin.Wizzair]: FlightType.Wizzair,
}

export const FlightTypeToOrigin = {
    [FlightType.Travala]: Origin.Travala,
    [FlightType.MilesAndMore]: Origin.MilesAndMore,
    [FlightType.Ryanair]: Origin.Ryanair,
    [FlightType.Wizzair]: Origin.Wizzair,
}

export const FlightLogoURL = {
    [FlightType.Travala]: "/logo/travala.svg",
    [FlightType.MilesAndMore]: "/logo/milesandmore.svg",
    [FlightType.Ryanair]: "/logo/ryanair.svg",
    [FlightType.Wizzair]: "/logo/wizzair.svg",
}

export const FlightName = {
    [FlightType.Travala]: "Travala",
    [FlightType.MilesAndMore]: "Miles and more",
    [FlightType.Ryanair]: "Ryanair",
    [FlightType.Wizzair]: "Wizzair",
}

export function flightsEqual(s1: Flight, s2: Flight) {
    return s1 && s2
        && s1.id === s2.id
        // && equal(s1.price, s2.price)
}