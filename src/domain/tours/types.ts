import { Origin } from "domain/extension"
import { Location } from "domain/location"
import { Money } from "type"
import equal from 'fast-deep-equal'

export enum TourType {
    GetYourGuide = 'getYourGuide',
    TripAdvisor = 'tripAdvisor',
    Viator = 'viator',
}

export interface Tour { 
    id: string,
    title: string,
    date: string,
    url?: string,
    price?: Money,
    totalParticipants?: number,
}

export const OriginToTourType = {
    [Origin.GetYourGuide]: TourType.GetYourGuide,
    [Origin.TripAdvisor]: TourType.TripAdvisor,
    [Origin.Viator]: TourType.Viator,
}

export const TourTypeToOrigin = {
    [TourType.GetYourGuide]: Origin.GetYourGuide,
    [TourType.TripAdvisor]: Origin.TripAdvisor,
    [TourType.Viator]: Origin.Viator,
}

export const TourLogoURL = {
    [TourType.GetYourGuide]: "/logo/getyourguide.svg",
    [TourType.TripAdvisor]: "/logo/tripadvisor.svg",
    [TourType.Viator]: "/logo/viator.jpeg",
}

export const TourName = {
    [TourType.GetYourGuide]: "GetYourGuide",
    [TourType.TripAdvisor]: "TripAdvisor",
    [TourType.Viator]: "Viator",
}

export function toursEqual(s1: Tour, s2: Tour) {
    return s1 && s2
        && s1.id === s2.id
        && s1.date === s2.date
        && s1.totalParticipants === s2.totalParticipants
        && equal(s1.price, s2.price)
}