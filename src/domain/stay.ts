import type { Location } from 'domain/location'

export interface Accomodation {
    name: string
    url?: string
}

export interface Stay {
    id: string
    since: string
    until: string
    location: Location
    accomodation?: Accomodation
}
