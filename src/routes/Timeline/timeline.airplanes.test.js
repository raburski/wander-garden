import assert from 'assert'
import { createTimelineEvents, createCheckinEvent, createTransportEvent, getCheckinLocation, TRANSPORT_MODE } from './timeline'
import { airport_cyprus, airport_wroclaw, fitness_wroclaw, restaurant_cyprus, airport_leszno } from './testData'

describe('timeline @ airplanes', function () {
    it('should create plane transport event with destination airport', function () {
        const checkins = [fitness_wroclaw, airport_cyprus]
        const events = createTimelineEvents(checkins)
        const expectedEvents = [
            createCheckinEvent(fitness_wroclaw),
            createTransportEvent(TRANSPORT_MODE.PLANE, getCheckinLocation(airport_cyprus), getCheckinLocation(fitness_wroclaw)),
            createCheckinEvent(airport_cyprus),
        ]
        assert.deepEqual(events, expectedEvents)
    })
    it('should create plane transport event with departure airport', function () {
        const checkins = [airport_cyprus, fitness_wroclaw]
        const events = createTimelineEvents(checkins)
        const expectedEvents = [
            createCheckinEvent(airport_cyprus),
            createTransportEvent(TRANSPORT_MODE.PLANE, getCheckinLocation(fitness_wroclaw), getCheckinLocation(airport_cyprus)),
            createCheckinEvent(fitness_wroclaw),
        ]
        assert.deepEqual(events, expectedEvents)
    })
    it('should create plane transport event with both airports', function () {
        const checkins = [airport_cyprus, airport_wroclaw]
        const events = createTimelineEvents(checkins)
        const expectedEvents = [
            createCheckinEvent(airport_cyprus),
            createTransportEvent(TRANSPORT_MODE.PLANE, getCheckinLocation(airport_wroclaw), getCheckinLocation(airport_cyprus)),
            createCheckinEvent(airport_wroclaw),
        ]
        assert.deepEqual(events, expectedEvents)
    })
    it('should create guessed plane transport event when no airports but huge distance within a day', function () {
        const checkins = [restaurant_cyprus, fitness_wroclaw]
        const events = createTimelineEvents(checkins)
        const expectedEvents = [
            createCheckinEvent(restaurant_cyprus),
            createTransportEvent(TRANSPORT_MODE.PLANE, getCheckinLocation(fitness_wroclaw), getCheckinLocation(restaurant_cyprus), true),
            createCheckinEvent(fitness_wroclaw),
        ]
        assert.deepEqual(events, expectedEvents)
    })
    it('should NOT create plane transport event when any airports but tiny distance within a day', function () {
        const checkins = [airport_leszno, fitness_wroclaw]
        const events = createTimelineEvents(checkins)
        const expectedEvents = [
            createCheckinEvent(airport_leszno),
            createCheckinEvent(fitness_wroclaw),
        ]
        assert.deepEqual(events, expectedEvents)
    })
})