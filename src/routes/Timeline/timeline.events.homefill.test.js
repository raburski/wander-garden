import assert from 'assert'
import moment from 'moment'
import { createTimelineEvents, createCheckinEvent, createHomeCheckinEvent, DAYS_INACTIVE_UNTIL_GUESS_HOME, createTransportEvent, createHomeCheckin } from './timeline.events'
import { airport_cyprus, airport_wroclaw, fitness_wroclaw, restaurant_limassol_cyprus, bus_station_warsaw } from './testData'
import { createPotentialHomeWithCheckin, getCheckinDate, getCheckinLocation } from '../../swarm/functions'
import { TransportMode } from './types'

const HOME = createPotentialHomeWithCheckin(fitness_wroclaw, moment('1991-01-01'), null)
const CONTEXT = {
    homes: [
        HOME
    ]
}

describe('timeline @ home fill', function () {
    it('should create home checkin events if no activity for longer than X', function () {
        const homeMoment = moment('1991-03-01T00:00:00')
        const fitnessBeforeMoment = moment(homeMoment.format())
        const fitnessAfterMoment = moment(homeMoment.format())
        fitnessBeforeMoment.subtract(DAYS_INACTIVE_UNTIL_GUESS_HOME, 'days')
        fitnessAfterMoment.add(DAYS_INACTIVE_UNTIL_GUESS_HOME, 'days')

        const fitnessBeforeHome = { ...fitness_wroclaw, createdAt: fitnessBeforeMoment.unix() }
        const fitnessAfterHome = { ...fitness_wroclaw, createdAt: fitnessAfterMoment.unix() }

        const checkins = [fitnessAfterHome, fitnessBeforeHome]
        const events = createTimelineEvents(checkins, CONTEXT)
        const expectedEvents = [
            createCheckinEvent(fitnessAfterHome),
            createCheckinEvent(createHomeCheckin(fitnessBeforeMoment.format(), fitnessAfterMoment.format(), CONTEXT)),
            createCheckinEvent(fitnessBeforeHome),
        ]
        assert.deepEqual(events, expectedEvents)
    })

    // it('should create home checkin events if no activity after landing in home country', function () {
    //     const NOW = moment()
    //     const localCheckinDate = moment(NOW).subtract(10, 'days')
    //     const airportCheckin = { ...airport_cyprus, createdAt: moment(NOW).subtract(11, 'days').unix() }
    //     const localCheckin = { ...bus_station_warsaw, createdAt: localCheckinDate.unix() }
    //     const distantTripCheckin = { ...restaurant_limassol_cyprus, createdAt: moment(NOW).unix() }


    //     const checkins = [distantTripCheckin, localCheckin, airportCheckin]
    //     const expectedHomeCheckinEvent = createHomeCheckinEvent(localCheckinDate.format(), moment(NOW).format(), CONTEXT)
    //     const events = createTimelineEvents(checkins, CONTEXT)
    //     const expectedEvents = [
    //         createCheckinEvent(distantTripCheckin),
    //         createTransportEvent(TransportMode.Plane, expectedHomeCheckinEvent.date, expectedHomeCheckinEvent.location, getCheckinLocation(distantTripCheckin)),
    //         expectedHomeCheckinEvent,
    //         createCheckinEvent(localCheckin),
    //         createTransportEvent(TransportMode.Plane, getCheckinDate(airportCheckin), getCheckinLocation(airportCheckin), getCheckinLocation(localCheckin)),
    //         createCheckinEvent(airportCheckin),
    //     ]

    //     console.dir(events)
    //     assert.deepEqual(events, expectedEvents)
    // })
})