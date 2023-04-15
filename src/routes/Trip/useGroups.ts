import { isEqualLocation, isEqualLocationCity, Location } from "domain/location"
import arrayQueryReplace, { any } from "domain/timeline/arrayQueryReplace"
import useTrip, { Phase, PhaseType, StayPhase } from "./useTrip"

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

function enhanceWithGuessedLocations(groups: Group[]) {
    // TODO: make it waaaay better with checkins data
    for (let i = 0; i < groups.length; i++) {
        if (groups[i].type === GroupType.Unknown && i > 0) {
            const currentGroup = groups[i] as UnknownGroup
            const previousGroup = groups[i - 1] as CityGroup
            const nextGroup = groups[i + 1] as CityGroup | undefined
            currentGroup.guessedLocations.push(previousGroup.location)
            if (nextGroup && !isEqualLocationCity(previousGroup.location, nextGroup.location)) {
                currentGroup.guessedLocations.push(nextGroup.location)
            }
        }
    }
    return groups
}

export default function useGroups(since: string, until: string): Group[] {
    const trip = useTrip(since, until)

    const groups = arrayQueryReplace(groupPhasesByCity(), trip?.phases || [])
    return enhanceWithGuessedLocations(groups)
}