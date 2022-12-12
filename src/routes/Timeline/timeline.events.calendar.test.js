import assert from 'assert'
import { createTimelineEvents, createCheckinEvent, createCalendarEvent } from './timeline.events'
import { airport_cyprus, airport_wroclaw, fitness_wroclaw, restaurant_limassol_cyprus, airport_leszno } from './testData'
import { getCheckinDate, getCheckinLocation } from '../../swarm/functions'
import { TransportMode, CalendarDayType } from './types'
import moment from 'moment'

describe('timeline @ calendar', function () {
    it('should create NYE events', function () {
        const NYEmoment = moment('1991-01-01T00:00:00')
        const fitnessBeforeMoment = moment(NYEmoment.format())
        const fitnessAfterMoment = moment(NYEmoment.format())
        fitnessBeforeMoment.subtract(5, 'hours')
        fitnessAfterMoment.add(5, 'hours')
        const fitnessBeforeNYE = { ...fitness_wroclaw, createdAt: fitnessBeforeMoment.unix() }
        const fitnessAfterNYE = { ...fitness_wroclaw, createdAt: fitnessAfterMoment.unix() }
        const checkins = [fitnessAfterNYE, fitnessBeforeNYE]
        const events = createTimelineEvents(checkins)
        const expectedEvents = [
            createCheckinEvent(fitnessAfterNYE),
            createCalendarEvent(NYEmoment, CalendarDayType.NewYear),
            createCheckinEvent(fitnessBeforeNYE),
        ]
        assert.deepEqual(events, expectedEvents)
    })
})