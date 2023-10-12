export default function createBadgeVerifier(visitedCountryCodes){
    const lowercasedCountryCodes = visitedCountryCodes.map(cc => cc.toLowerCase())
    return function verifyBadge(badge) {
        let acquired = false
        let filled = false
        let matching = []
        if (badge.oneOfCountry) {
            const confirmedVisitedCountryCodes = lowercasedCountryCodes.filter(cc => badge.oneOfCountry.includes(cc))
            if (confirmedVisitedCountryCodes.length > 0) {
                acquired = true
                matching = confirmedVisitedCountryCodes
                filled = badge.oneOfCountry.length === confirmedVisitedCountryCodes.length
            }
        } else if (badge.allOfCountry) {
            const confirmedVisitedCountryCodes = lowercasedCountryCodes.filter(cc => badge.allOfCountry.includes(cc))
            if (confirmedVisitedCountryCodes.length === badge.allOfCountry.length) {
                acquired = true
                matching = confirmedVisitedCountryCodes
                filled = true
            }
        }
        return {
            ...badge,
            matching,
            acquired,
            filled,
        }
    }
}