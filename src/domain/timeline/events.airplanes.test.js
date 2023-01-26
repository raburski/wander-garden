import assert from 'assert'
import { createTimelineEvents, createCheckinEvent, createTransportEvent } from './events'
import { airport_cyprus, airport_wroclaw, fitness_wroclaw, restaurant_limassol_cyprus, airport_leszno } from './testData'
import { getCheckinDate, getCheckinLocation } from '../swarm/functions'
import { createPotentialHomeWithCheckin } from 'domain/homes'
import { TransportMode } from './types'
import { chronological } from './testing'
import moment from 'moment'

const HOME = createPotentialHomeWithCheckin(fitness_wroclaw, moment('1960-01-01'), null)
const CONTEXT = {
    homes: [
        HOME
    ]
}

describe('timeline @ airplanes', function () {
    it('should create plane transport event with destination airport', function () {
        const checkins = chronological([fitness_wroclaw, airport_cyprus])
        const events = createTimelineEvents({ checkins })
        const expectedEvents = [
            createCheckinEvent(checkins[0]),
            createTransportEvent(TransportMode.Plane, getCheckinDate(checkins[1]), getCheckinLocation(checkins[1]), getCheckinLocation(checkins[0])),
            createCheckinEvent(checkins[1]),
        ]
        assert.deepEqual(events, expectedEvents)
    })
    it('should create plane transport event with departure airport', function () {
        const checkins = chronological([airport_cyprus, fitness_wroclaw])
        const events = createTimelineEvents({ checkins })
        const expectedEvents = [
            createCheckinEvent(checkins[0]),
            createTransportEvent(TransportMode.Plane, getCheckinDate(checkins[0]), getCheckinLocation(checkins[1]), getCheckinLocation(checkins[0])),
            createCheckinEvent(checkins[1]),
        ]
        assert.deepEqual(events, expectedEvents)
    })
    it('should create plane transport event with both airports', function () {
        const fixedAirportWroclaw = { ...airport_wroclaw, createdAt: airport_cyprus.createdAt - 1 * 24 * 60}
        const checkins = [airport_cyprus, fixedAirportWroclaw]
        const events = createTimelineEvents({ checkins })
        const expectedEvents = [
            createCheckinEvent(airport_cyprus),
            createTransportEvent(TransportMode.Plane, getCheckinDate(airport_cyprus), getCheckinLocation(fixedAirportWroclaw), getCheckinLocation(airport_cyprus)),
            createCheckinEvent(fixedAirportWroclaw),
        ]
        assert.deepEqual(events, expectedEvents)
    })
    it('should create guessed plane transport event when no airports but huge distance within a day', function () {
        const checkins = chronological([restaurant_limassol_cyprus, fitness_wroclaw])
        const events = createTimelineEvents({ checkins }, CONTEXT)
        const expectedEvents = [
            createCheckinEvent(checkins[0]),
            createTransportEvent(TransportMode.Plane, getCheckinDate(checkins[0]), getCheckinLocation(checkins[1]), getCheckinLocation(checkins[0]), true),
            createCheckinEvent(checkins[1]),
        ]
        assert.deepEqual(events, expectedEvents)
    })
    it('should create guessed plane transport event with date matching non-home event', function () {
        const checkins = chronological([fitness_wroclaw, restaurant_limassol_cyprus])
        const events = createTimelineEvents({ checkins }, CONTEXT)
        const expectedEvents = [
            createCheckinEvent(checkins[0]),
            createTransportEvent(TransportMode.Plane, getCheckinDate(checkins[1]), getCheckinLocation(checkins[1]), getCheckinLocation(checkins[0]), true),
            createCheckinEvent(checkins[1]),
        ]
        assert.deepEqual(events, expectedEvents)
    })
    it('should NOT create plane transport event when any airports but tiny distance within a day', function () {
        const checkins = chronological([airport_leszno, fitness_wroclaw])
        const events = createTimelineEvents({ checkins })
        const expectedEvents = [
            createCheckinEvent(checkins[0]),
            createCheckinEvent(checkins[1]),
        ]
        assert.deepEqual(events, expectedEvents)
    })
})