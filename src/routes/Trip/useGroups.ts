import { isEqualLocation, isEqualLocationCity, isEqualLocationCountry, Location } from "domain/location"
import arrayQueryReplace, { any } from "domain/timeline/arrayQueryReplace"
import useTrip, { Phase, PhaseType, StayPhase, UnknownPhase } from "./useTrip"

export enum GroupType {
    Unknown = 'unknown',
    City = 'city',
    Country = 'country',
}

export interface Group {
    type: GroupType
    phases: Phase[]
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


type GroupPhasesByCityContext = { phaseType: PhaseType, location: Location }
function groupPhasesByCity() {
    return {
        pattern: [
            (phase: Phase, phases: Phase[], context: GroupPhasesByCityContext) => {
                context.phaseType = phase.type
                context.location = (phase as StayPhase)?.stay?.location
                return true
            },
            any((phase: Phase, phases: Phase[], context: GroupPhasesByCityContext) => {
                if (phase.type !== context.phaseType) {
                    return false
                }
                if (phase.type === PhaseType.Stay) {
                    return isEqualLocationCity((phase as StayPhase).stay.location, context.location)
                }
                return false
            }),
        ],
        result: (phases: Phase[], context: GroupPhasesByCityContext) => {
            if (context.phaseType === PhaseType.Stay) {
                return {
                    type: GroupType.City,
                    phases,
                    location: context.location,
                    since: phases[0].since,
                    until: phases[phases.length - 1].until

                }
            }
            return {
                type: GroupType.Unknown,
                phases,
                guessedLocations: [],
                since: phases[0].since,
                until: phases[phases.length - 1].until
            }
        }
    }
}

type GroupPhasesByCountryContext = { phaseType: PhaseType, location: Location }
function groupPhasesByCountry() {
    return {
        pattern: [
            (phase: Phase, phases: Phase[], context: GroupPhasesByCountryContext) => {
                context.phaseType = phase.type
                context.location = (phase as StayPhase)?.stay?.location
                return true
            },
            any((phase: Phase, phases: Phase[], context: GroupPhasesByCountryContext) => {
                if (phase.type !== context.phaseType) {
                    return false
                }
                if (phase.type === PhaseType.Stay) {
                    return isEqualLocationCountry((phase as StayPhase).stay.location, context.location)
                }
                return false
            }),
        ],
        result: (phases: Phase[], context: GroupPhasesByCountryContext) => {
            if (context.phaseType === PhaseType.Stay) {
                return {
                    type: GroupType.Country,
                    phases,
                    location: context.location,
                    since: phases[0].since,
                    until: phases[phases.length - 1].until

                }
            }
            return {
                type: GroupType.Unknown,
                phases,
                guessedLocations: phases.flatMap(p => (p as UnknownPhase).guessedLocations),
                since: phases[0].since,
                until: phases[phases.length - 1].until
            }
        }
    }
}

export default function useGroups(since: string, until: string): Group[] {
    const trip = useTrip(since, until)

    return arrayQueryReplace(groupPhasesByCountry(), trip?.phases || [])
}