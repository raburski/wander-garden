import assert from 'assert'
import moment from 'moment'
import { createTimelineEvents, createCheckinEvent, createHomeCheckinEvent, DAYS_INACTIVE_UNTIL_GUESS_HOME, createTransportEvent, createHomeCheckin } from './timeline.events'
import { airport_cyprus, airport_wroclaw, fitness_wroclaw, restaurant_limassol_cyprus, bus_station_warsaw, restaurant_leszno } from './testData'
import { createPotentialHomeWithCheckin, getCheckinDate, getCheckinLocation } from '../../domain/swarm/functions'
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

    it('should create home checkin events if no activity after landing in home country', function () {
        const NOW = moment()
        const homeCountryCheckinDate = moment(NOW).subtract(6, 'days')
        
        const otherHomeCountryTripCheckin = { ...restaurant_leszno, createdAt: moment(NOW).unix() }
        const homeCountryCheckin = { ...bus_station_warsaw, createdAt: homeCountryCheckinDate.unix() }
        const airportCheckin = { ...airport_cyprus, createdAt: moment(NOW).subtract(7, 'days').unix() }

        const checkins = [
            otherHomeCountryTripCheckin,
            homeCountryCheckin,
            airportCheckin,
        ]
        const expectedHomeCheckin = createHomeCheckin(getCheckinDate(homeCountryCheckin).format(), getCheckinDate(otherHomeCountryTripCheckin).format(), CONTEXT)

        const events = createTimelineEvents(checkins, CONTEXT)
        const expectedEvents = [
            createCheckinEvent(otherHomeCountryTripCheckin),
            createTransportEvent(TransportMode.Car, getCheckinDate(otherHomeCountryTripCheckin), getCheckinLocation(expectedHomeCheckin), getCheckinLocation(otherHomeCountryTripCheckin), true),
            createCheckinEvent(expectedHomeCheckin),
            createTransportEvent(TransportMode.Car, getCheckinDate(expectedHomeCheckin), getCheckinLocation(homeCountryCheckin), getCheckinLocation(expectedHomeCheckin), true),
            createCheckinEvent(homeCountryCheckin),
            createTransportEvent(TransportMode.Plane, getCheckinDate(airportCheckin), getCheckinLocation(airportCheckin), getCheckinLocation(homeCountryCheckin), false),
            createCheckinEvent(airportCheckin),
        ]

        assert.deepEqual(events, expectedEvents)
    })
})