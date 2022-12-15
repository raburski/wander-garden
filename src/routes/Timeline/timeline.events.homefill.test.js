import assert from 'assert'
import moment from 'moment'
import { createTimelineEvents, createCheckinEvent, createHomeCheckinEvent, DAYS_INACTIVE_UNTIL_GUESS_HOME } from './timeline.events'
import { airport_cyprus, airport_wroclaw, fitness_wroclaw, restaurant_limassol_cyprus, airport_leszno } from './testData'
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
            createHomeCheckinEvent(fitnessBeforeMoment.format(), fitnessAfterMoment.format(), CONTEXT),
            createCheckinEvent(fitnessBeforeHome),
        ]
        assert.deepEqual(events, expectedEvents)
    })
})