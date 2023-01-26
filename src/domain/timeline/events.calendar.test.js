import assert from 'assert'
import { createTimelineEvents, createCheckinEvent, createNewHomeCalendarEvent, createNewYearCalendarEvent } from './events'
import { fitness_wroclaw, restaurant_limassol_cyprus } from './testData'
import moment from 'moment'
import { createPotentialHomeWithCheckin } from '../homes/functions'

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
        const events = createTimelineEvents({ checkins })
        const expectedEvents = [
            createCheckinEvent(fitnessAfterNYE),
            createNewYearCalendarEvent(NYEmoment),
            createCheckinEvent(fitnessBeforeNYE),
        ]
        assert.deepEqual(events, expectedEvents)
    })

    it('should create NEW HOME events', function () {
        const homeChangeDate = moment('1991-02-01')
        const POLAND_HOME = createPotentialHomeWithCheckin(fitness_wroclaw, moment('1991-01-01'), homeChangeDate)
        const CYPRUS_HOME = createPotentialHomeWithCheckin(restaurant_limassol_cyprus, homeChangeDate, null)
        const CONTEXT = {
            homes: [
                CYPRUS_HOME,
                POLAND_HOME,
            ]
        }

        const eventBeforeMoment = moment(homeChangeDate.format())
        const eventAfterMoment = moment(homeChangeDate.format())
        eventBeforeMoment.subtract(2, 'days')
        eventAfterMoment.add(2, 'days')

        const polandBeforeMove = { ...fitness_wroclaw, createdAt: eventBeforeMoment.unix() }
        const cyprusAfterMove = { ...fitness_wroclaw, createdAt: eventAfterMoment.unix() }
        const checkins = [cyprusAfterMove, polandBeforeMove]

        const events = createTimelineEvents({ checkins }, CONTEXT)
        const expectedEvents = [
            createCheckinEvent(cyprusAfterMove),
            createNewHomeCalendarEvent(homeChangeDate, POLAND_HOME, CYPRUS_HOME),
            createCheckinEvent(polandBeforeMove),
        ]
        assert.deepEqual(events, expectedEvents)
    })
})