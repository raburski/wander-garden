export enum Status {
    Unknown = 'UNKNOWN',
    Connected = 'CONNECTED',
    Failed = 'FAILED',
    Incompatible = 'INCOMPATIBLE',
    Capturing = 'CAPTURING',
}

export enum Origin {
    Garden = 'wander_garden',
    Extension = 'wander_garden_extension',
    Service = 'wander_garden_service',
    Booking = 'booking.com_extension',
    Airbnb = 'airbnb_extension',
    Agoda = 'agoda_extension',
    Travala = 'travala_extension',
}

export enum StayType {
    Booking = 'booking',
    Airbnb = 'airbnb',
    Agoda = 'agoda',
    Travala = 'travala',
}

export const StayTypeToOrigin = {
    [StayType.Agoda]: Origin.Agoda,
    [StayType.Airbnb]: Origin.Airbnb,
    [StayType.Booking]: Origin.Booking,
    [StayType.Travala]: Origin.Travala,
}

export const StayLogoURL = {
    [StayType.Agoda]: "/logo/agoda.svg",
    [StayType.Airbnb]: "/logo/airbnb.svg",
    [StayType.Booking]: "/logo/bookingcom.svg",
    [StayType.Travala]: "/logo/travala.svg",
}

export const StayName = {
    [StayType.Agoda]: "Agoda",
    [StayType.Airbnb]: "Airbnb",
    [StayType.Booking]: "Booking.com",
    [StayType.Travala]: "Travala",
}