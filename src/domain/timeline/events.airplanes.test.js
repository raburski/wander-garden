import assert from 'assert'
import { createTimelineEvents, createCheckinEvent, createTransportEvent } from './events'
import { airport_cyprus, airport_wroclaw, fitness_wroclaw, restaurant_limassol_cyprus, airport_leszno } from './testData'
import { getCheckinDate, getCheckinLocation } from '../swarm/functions'
import { TransportMode } from './types'

describe('timeline @ airplanes', function () {
    it('should create plane transport event with destination airport', function () {
        const checkins = [fitness_wroclaw, airport_cyprus]
        const events = createTimelineEvents(checkins)
        const expectedEvents = [
            createCheckinEvent(fitness_wroclaw),
            createTransportEvent(TransportMode.Plane, getCheckinDate(airport_cyprus), getCheckinLocation(airport_cyprus), getCheckinLocation(fitness_wroclaw)),
            createCheckinEvent(airport_cyprus),
        ]
        assert.deepEqual(events, expectedEvents)
    })
    it('should create plane transport event with departure airport', function () {
        const checkins = [airport_cyprus, fitness_wroclaw]
        const events = createTimelineEvents(checkins)
        const expectedEvents = [
            createCheckinEvent(airport_cyprus),
            createTransportEvent(TransportMode.Plane, getCheckinDate(airport_cyprus), getCheckinLocation(fitness_wroclaw), getCheckinLocation(airport_cyprus)),
            createCheckinEvent(fitness_wroclaw),
        ]
        assert.deepEqual(events, expectedEvents)
    })
    it('should create plane transport event with both airports', function () {
        const fixedAirportWroclaw = { ...airport_wroclaw, createdAt: airport_cyprus.createdAt - 1 * 24 * 60}
        const checkins = [airport_cyprus, fixedAirportWroclaw]
        const events = createTimelineEvents(checkins)
        const expectedEvents = [
            createCheckinEvent(airport_cyprus),
            // TODO: extrapolate date
            createTransportEvent(TransportMode.Plane, getCheckinDate(airport_cyprus), getCheckinLocation(fixedAirportWroclaw), getCheckinLocation(airport_cyprus)),
            createCheckinEvent(fixedAirportWroclaw),
        ]
        assert.deepEqual(events, expectedEvents)
    })
    it('should create guessed plane transport event when no airports but huge distance within a day', function () {
        const checkins = [restaurant_limassol_cyprus, fitness_wroclaw]
        const events = createTimelineEvents(checkins)
        const expectedEvents = [
            createCheckinEvent(restaurant_limassol_cyprus),
            // TODO: extrapolate date
            createTransportEvent(TransportMode.Plane, getCheckinDate(restaurant_limassol_cyprus), getCheckinLocation(fitness_wroclaw), getCheckinLocation(restaurant_limassol_cyprus), true),
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