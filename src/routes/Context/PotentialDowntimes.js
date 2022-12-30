import { onlyNonGrocery, onlyNonTransportation } from '../../domain/swarm/categories'
import { TYPE, useEvents } from '../../domain/events'
import { styled } from "goober"
import moment from 'moment'
import countryFlagEmoji from "country-flag-emoji"
import { cleanLocation } from '../../domain/location'
import NoneFound from './NoneFound'

const DATE_FORMAT = 'DD/MM/YYYY'
const BINGE_WATCH_THRESHOLD = 5

function calculateScore(numberOfWatches, numberOfCheckins, daysSinceLastEvents) {
    // TODO: add games

    // the more watches, games and fewer checkins the greater the score
    const watchesScore = numberOfWatches >= BINGE_WATCH_THRESHOLD ? Math.pow(1.1, numberOfWatches) : 1
    const checkinScore = numberOfWatches >= BINGE_WATCH_THRESHOLD ? Math.pow(0.9, numberOfCheckins) : Math.pow(1.1, numberOfWatches)

    if (numberOfCheckins === 0 && numberOfWatches === 0) {
        // none
        // should not happen that this function is called without events
        return 0
    } else if (numberOfCheckins === 0) {
        // just watches
        return daysSinceLastEvents < 1 ? watchesScore : watchesScore * Math.pow(0.8, daysSinceLastEvents)

    } else if (numberOfWatches === 0) {
        // just checkins
        return - checkinScore * Math.pow(1.2, daysSinceLastEvents)

    } else {
        // both checkins and watches
        return (watchesScore - checkinScore) * Math.pow(0.8, daysSinceLastEvents)
    }
}

function getPotentialDowntimes(events) {
    let potentialDowntimes = []
    let currentDowntimeScore = 0
    let downtimeStartDate = null 
    const DOWNTIME_THRESHOLD = 10
    

    const orderedDates = events.reduce((acc, e) => {
        const key = moment(e.date).format(DATE_FORMAT)
        return acc.includes(key) ? acc : [...acc, key]
    }, []).reverse()
    const groupedEventsByDate = events.reduce((acc, e) => {
        const key = moment(e.date).format(DATE_FORMAT)
        return { ...acc, [key]: [...(acc[key] || []), e] }
    }, {})

    // iterate older to newer dates
    let lastDate = null
    for (let date of orderedDates) {
        const daysSinceLastEvents = lastDate ? moment.duration(moment(date, DATE_FORMAT).diff(moment(lastDate, DATE_FORMAT))).asDays() : 0
        lastDate = date

        const numberOfWatches = groupedEventsByDate[date].filter(e => e.type === TYPE.WATCH).length
        const numberOfCheckins = groupedEventsByDate[date].filter(e => e.type === TYPE.CHECKIN).length
        const downtimeScoreForDate = calculateScore(numberOfWatches, numberOfCheckins, daysSinceLastEvents)
        console.log('daysSinceLastEvents', daysSinceLastEvents)
        currentDowntimeScore = Math.max(0, currentDowntimeScore + downtimeScoreForDate) //* Math.pow(0.9, daysSinceLastEvents)
        console.log(date, '[', numberOfWatches, numberOfCheckins, downtimeScoreForDate, ']', currentDowntimeScore)
        if (currentDowntimeScore >= DOWNTIME_THRESHOLD) {
            if (!downtimeStartDate) {
                console.log('over threshold new downtime')
                downtimeStartDate = date
            }
        } else {
            if (downtimeStartDate) {
                potentialDowntimes.push({ started: downtimeStartDate, ended: date })
                currentDowntimeScore = 0
                downtimeStartDate = null
            }
        }
    }
    console.log(' ----------- ')
    return potentialDowntimes
}

function Downtime({ downtime }) {
    return <div>{JSON.stringify(downtime)}</div>
}

export default function PotentialDowntimes() {
    const events = useEvents().filter(onlyNonGrocery).filter(onlyNonTransportation)
    const potentialDowntimes = getPotentialDowntimes(events)

    return (
        <div>
            <h3>You seemed to have some downtime</h3>
            {potentialDowntimes.length > 0 ? potentialDowntimes.map(down => <Downtime downtime={down} />) : <NoneFound />}
        </div>
    )
}