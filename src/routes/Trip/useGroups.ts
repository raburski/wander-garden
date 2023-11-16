import { isEqualLocation, isEqualLocationCity, isEqualLocationCountry, Location } from "domain/location"
import arrayQueryReplace, { any } from "domain/timeline/arrayQueryReplace"
import { Trip, TripPhase } from "domain/trips/types"

export enum GroupType {
    Unknown = 'unknown',
    City = 'city',
    Country = 'country',
}

export interface Group {
    type: GroupType
    phases: TripPhase[]
    since: string
    until: string
}

export interface CityGroup extends Group {
    type: GroupType.City
    location: Location
}

export interface CountryGroup extends Group {
    type: GroupType.Country
    location: Location
}

export interface UnknownGroup extends Group {
    type: GroupType.Unknown
    guessedLocations: Location[]
}


// type GroupPhasesByCityContext = { phaseType: PhaseType, location: Location }
// function groupPhasesByCity() {
//     return {
//         pattern: [
//             (phase: Phase, phases: Phase[], context: GroupPhasesByCityContext) => {
//                 context.phaseType = phase.type
//                 context.location = (phase as StayPhase)?.stay?.location
//                 return true
//             },
//             any((phase: Phase, phases: Phase[], context: GroupPhasesByCityContext) => {
//                 if (phase.type !== context.phaseType) {
//                     return false
//                 }
//                 if (phase.type === PhaseType.Stay) {
//                     return isEqualLocationCity((phase as StayPhase).stay.location, context.location)
//                 }
//                 return false
//             }),
//         ],
//         result: (phases: Phase[], context: GroupPhasesByCityContext) => {
//             if (context.phaseType === PhaseType.Stay) {
//                 return {
//                     type: GroupType.City,
//                     phases,
//                     location: context.location,
//                     since: phases[0].since,
//                     until: phases[phases.length - 1].until

//                 }
//             }
//             return {
//                 type: GroupType.Unknown,
//                 phases,
//                 guessedLocations: [],
//                 since: phases[0].since,
//                 until: phases[phases.length - 1].until
//             }
//         }
//     }
// }

type GroupPhasesByCountryContext = { location: Location }
function groupPhasesByCountry() {
    return {
        pattern: [
            (phase: TripPhase, phases: TripPhase[], context: GroupPhasesByCountryContext) => {
                context.location = phase.stay!.location
                return true
            },
            any((phase: TripPhase, phases: TripPhase[], context: GroupPhasesByCountryContext) => {
                return !phase.stay || isEqualLocationCountry(phase.stay.location, context.location)
            }),
        ],
        result: (phases: TripPhase[], context: GroupPhasesByCountryContext) => {
            return {
                type: GroupType.Country,
                phases,
                location: context.location,
                since: phases[0].since,
                until: phases[phases.length - 1].until
            }
        }
    }
}

export default function useGroups(trip: Trip): Group[] {
    return arrayQueryReplace(groupPhasesByCountry(), trip?.phases || [])
}