import assert from 'assert'
import moment from 'moment'
import { createCheckinEvent, createNewYearCalendarEvent } from './events'
import { createTimelineGroups, createTripGroup, createPlainGroup } from './groups'
import { fitness_wroclaw } from './testData'

describe('timeline group calendar', function () {
    it('should create plain group for calendar event', function () {
        const events = [
            createNewYearCalendarEvent(moment('1991-01-01', 'YYYY-MM-DD')),
        ]
        const groups = createTimelineGroups(events)
        const expectedGroups = [
            createPlainGroup(events)
        ]
        assert.deepEqual(groups, expectedGroups)
    })
    // it('should place calendar event after current group if it has already started', function () {
    //     const checkinEvent = createCheckinEvent(fitness_wroclaw)
    //     const calendarEvent = createNewYearCalendarEvent('1991-01-01')
    //     const events = [
    //         checkinEvent,
    //         calendarEvent,
    //         checkinEvent
    //     ]
    //     const groups = createTimelineGroups(events)
    //     const expectedGroups = [
    //         createPlainGroup([calendarEvent]),
    //         createContainerGroup([createTripGroup([checkinEvent, checkinEvent])])
    //     ]
    //     // console.dir(groups, { depth: null })
    //     // console.dir(expectedGroups, { depth: null })
    //     assert.deepEqual(groups, expectedGroups)
    // })
    it('should place calendar event straight away if no current groups', function () {
        const checkinEvent = createCheckinEvent(fitness_wroclaw)
        const calendarEvent = createNewYearCalendarEvent(moment('1991-01-01', 'YYYY-MM-DD'))
        const events = [
            checkinEvent,
            checkinEvent,
            calendarEvent,
        ]
        const groups = createTimelineGroups(events)
        const expectedGroups = [
            createPlainGroup([calendarEvent]),
            createTripGroup([checkinEvent, checkinEvent]),
        ]
        assert.deepEqual(groups, expectedGroups)
    })
    // it('should place calendar event after current groups if there are many', function () {
    //     const POLAND_HOME = createPotentialHomeWithCheckin(fitness_wroclaw, moment('1991-01-01'), null)
    //     const CONTEXT = {
    //         homes: [
    //             POLAND_HOME,
    //         ]
    //     }

    //     const homeCheckinEvent = createCheckinEvent(fitness_wroclaw)
    //     const berlinCheckinEvent = createCheckinEvent(burger_berlin)
    //     const calendarEvent = createNewYearCalendarEvent('1991-01-01')
    //     const events = [
    //         berlinCheckinEvent,
    //         calendarEvent,
    //         berlinCheckinEvent,
    //         homeCheckinEvent,
    //     ]
    //     const groups = createTimelineGroups(events, CONTEXT)
    //     const expectedGroups = [
    //         createPlainGroup([calendarEvent]),
    //         createContainerGroup([createTripGroup([berlinCheckinEvent, berlinCheckinEvent])]),
    //         createContainerGroup([createHomeGroup([homeCheckinEvent])])
    //     ]
    //     console.dir(groups, {depth:null})
    //     console.dir(expectedGroups, {depth:null})
    //     assert.deepEqual(groups, expectedGroups)
    // })
})