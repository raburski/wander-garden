export default function createBadgeVerifier(visitedCountryCodes){
    const lowercasedCountryCodes = visitedCountryCodes.map(cc => cc.toLowerCase())
    return function verifyBadge(badge) {
        let acquired = false
        let matching = []
        const confirmedVisitedCountryCodes = lowercasedCountryCodes.filter(cc => badge.oneOfCountry.includes(cc))
        if (badge.oneOfCountry && confirmedVisitedCountryCodes.length > 0) {
            acquired = true
            matching = confirmedVisitedCountryCodes
        }
        return {
            ...badge,
            matching,
            acquired,
        }
    }
}