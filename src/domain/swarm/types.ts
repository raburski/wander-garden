import type { Location } from "../location"

export interface Category {
    id: string
}

export interface Venue {
    location: Location
    categories: Category[]
}

export interface Checkin {
    id: string
    type?: any
    venue: Venue
    createdAt: number
}

export default {}