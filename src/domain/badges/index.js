import { useRegionalBadges } from './regions'
export * from './regions'

export function useAcquiredBadges() {
    const regionalBadges = useRegionalBadges()
    return regionalBadges.filter(b => b.acquired)
}