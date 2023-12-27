export enum Status {
    Unknown = 'UNKNOWN',
    Connected = 'CONNECTED',
    InitFailed = 'INIT_FAILED',
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

    GetYourGuide = 'get_your_guide_extension',
    TripAdvisor = 'trip_advisor_extension',

    TravalaFlights = 'travala_flights',
    MilesAndMore = 'miles_and_more',
    Ryanair = 'ryanair',
}
