import { useRegionalBadges } from './regions'
import { useReligionBadges } from './religions'
export * from './regions'
export * from './religions'

export function useAcquiredBadges() {
    const regionalBadges = useRegionalBadges()
    const religionBadges = useReligionBadges()
    return [...regionalBadges, ...religionBadges].filter(b => b.acquired)
}