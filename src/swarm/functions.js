import moment from 'moment'
import { cleanLocation, getCheckinLocation } from '../location'

export function createPotentialHome(location, since, until) {
    return {
        location,
        since: typeof since === 'string' ? since : since && since.format('YYYY-MM-DD'),
        until: typeof until === 'string' ? until : until && until.format('YYYY-MM-DD'),
    }
}

export function createPotentialHomeWithCheckin(checkin, since, until) {
    return createPotentialHome(getCheckinLocation(checkin), since, until)
}

export function getCheckinDate(checkin) {
    return  moment.unix(checkin.createdAt)
}

export function getPotentialHomes(checkins) {
    let currentHomeCheckin = null
    let currentHomeCheckinCity = null

    const potentialHomes = []
    const cityWeight = {}
    // make those dynamic depending on user checkin ratios
    const WEIGHT_THRESHOLD = 30 // ~miesiąc
    const WEIGHT_DETERIORATE = 0.98 // per day
    const WEIGHT_INCREASE = 1.6

    function deteriorateCities(numberOfDays) {
        const weight = Math.pow(WEIGHT_DETERIORATE, numberOfDays)
        for (let city of Object.keys(cityWeight)) {
            cityWeight[city] = cityWeight[city] < 0.1 ? 0 : cityWeight[city] * weight
        }
    }

    for (let i = checkins.length - 2; i >= 0; i--) {
        let currentWeight = WEIGHT_INCREASE

        const olderCheckin = checkins[i + 1]
        const checkin = checkins[i]
        const date = getCheckinDate(checkin)
        const olderDate = getCheckinDate(olderCheckin)

        const city = cleanLocation(checkin.venue.location.city)
        const olderCity = cleanLocation(olderCheckin.venue.location.city)

        const duration = moment.duration(date.diff(olderDate))
        const daysDuration = duration.asHours() / 24
        
        deteriorateCities(daysDuration)

        if (!city) continue;
        if (city === olderCity) {
            currentWeight = currentWeight * daysDuration
        }
        cityWeight[city] = (cityWeight[city] || 0) + currentWeight
        
        if (currentHomeCheckinCity === city) continue

        if (cityWeight[city] > WEIGHT_THRESHOLD && cityWeight[city] > (cityWeight[currentHomeCheckinCity] || 0)) {
            if (currentHomeCheckin) {
                let lastCheckInCurrentHome = null
                const currentHomeCheckinIndex = checkins.indexOf(currentHomeCheckin)
                // look since now until current home checkin to find last checkin in current location
                for (let index = i; index < currentHomeCheckinIndex; index++) {
                    const checkedCheckin = checkins[index]
                    if (cleanLocation(checkedCheckin.venue.location.city) === currentHomeCheckinCity) {
                        lastCheckInCurrentHome = checkedCheckin
                        break
                    }
                }
                let firstCheckInNewHome = null
                const currentHomeLastCheckinIndex = checkins.indexOf(lastCheckInCurrentHome)
                // look since last checkin in current location till now  to find first checkin in new location
                for (let index = currentHomeLastCheckinIndex + 1; index >= i; index--) {
                    const checkedCheckin = checkins[index]
                    if (cleanLocation(checkedCheckin.venue.location.city) === city) {
                        firstCheckInNewHome = checkedCheckin
                        break
                    }
                }
                // add previous home to the list
                potentialHomes.push(
                    createPotentialHomeWithCheckin(
                        currentHomeCheckin,
                        potentialHomes.length > 0 ? potentialHomes[potentialHomes.length - 1].until : null,
                        firstCheckInNewHome ? getCheckinDate(firstCheckInNewHome) : null,
                    )
                )
            }
            currentHomeCheckin = checkin
            currentHomeCheckinCity = cleanLocation(currentHomeCheckin.venue.location.city)
        }
    }
    if (currentHomeCheckin) {
        // add previous home to the list
        potentialHomes.push(
            createPotentialHomeWithCheckin(
                currentHomeCheckin,
                potentialHomes.length > 0 ? potentialHomes[potentialHomes.length - 1].until : null
            )
        )
    }
    return potentialHomes
}
