import { Origin } from "domain/extension"
import { Location } from "domain/location"
import { Money } from "type"

export enum TourType {
    GetYourGuide = 'getYourGuide',
    TripAdvisor = 'tripAdvisor',
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
}

export const TourTypeToOrigin = {
    [TourType.GetYourGuide]: Origin.GetYourGuide,
    [TourType.TripAdvisor]: Origin.TripAdvisor,
}

export const TourLogoURL = {
    [TourType.GetYourGuide]: "/logo/getyourguide.svg",
    [TourType.TripAdvisor]: "/logo/tripadvisor.svg",
}

export const TourName = {
    [TourType.GetYourGuide]: "GetYourGuide",
    [TourType.TripAdvisor]: "TripAdvisor",
}
