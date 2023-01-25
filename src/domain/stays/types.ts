import type { Location } from 'domain/location'

export interface Hotel {
    name: string
    url: string
}

export interface Stay {
    id: string
    since: string
    until: string
    location: Location
    hotel: Hotel
}
