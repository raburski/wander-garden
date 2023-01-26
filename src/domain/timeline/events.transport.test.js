import assert from 'assert'
import { createTimelineEvents, createCheckinEvent, createTransportEvent } from './events'
import { fitness_wroclaw, restaurant_leszno, undefined_city_cyprus, restaurant_limassol_cyprus, airport_cyprus, restaurant_pafos_cyprus } from './testData'
import { getCheckinDate, getCheckinLocation } from '../swarm/functions'
import { TransportMode } from './types'
import { chronological } from './testing'

describe('timeline @ transport', function () {
    it('should create guess car transport event with any other city change but smaller distance than plane flight', function () {
        const checkins = chronological([
            restaurant_leszno,
            fitness_wroclaw
        ])
        const events = createTimelineEvents({ checkins })
        const expectedEvents = [
            createCheckinEvent(checkins[0]),
            createTransportEvent(TransportMode.Car, getCheckinDate(checkins[0]), getCheckinLocation(checkins[1]), getCheckinLocation(checkins[0]), true),
            createCheckinEvent(checkins[1]),
        ]
        assert.deepEqual(events, expectedEvents)
    })
    it('should create guess car transport event with any other city change but smaller distance than plane flight', function () {
        const checkins = chronological([
            restaurant_leszno,
            fitness_wroclaw
        ])
        const events = createTimelineEvents({ checkins })
        const expectedEvents = [
            createCheckinEvent(checkins[0]),
            createTransportEvent(TransportMode.Car, getCheckinDate(checkins[0]), getCheckinLocation(checkins[1]), getCheckinLocation(checkins[0]), true),
            createCheckinEvent(checkins[1]),
        ]
        assert.deepEqual(events, expectedEvents)
    })
    // TODO: update once you define better when its actual airport transport vs when its just picking someone up
    // it('should create guess bus transport event with city change from airport and small distance', function () {
    //     const checkins = chronological([tearoom_stezzano, airport_lombardy])
    //     const events = createTimelineEvents({ checkins })
    //     const expectedEvents = [
    //         createCheckinEvent(tearoom_stezzano),
    //         createTransportEvent(TransportMode.Bus, getCheckinDate(airport_lombardy), getCheckinLocation(airport_lombardy), getCheckinLocation(tearoom_stezzano), true),
    //         createCheckinEvent(airport_lombardy),
    //     ]
    //     assert.deepEqual(events, expectedEvents)
    // })

    it('should create guess car transport event with any other city change even with undefined city', function () {
        const checkins = chronological([restaurant_limassol_cyprus, undefined_city_cyprus, restaurant_pafos_cyprus, airport_cyprus])
        const events = createTimelineEvents({ checkins })
        const expectedEvents = [
            createCheckinEvent(checkins[0]),
            // TODO: later smart guess its a bus!
            createTransportEvent(TransportMode.Car, getCheckinDate(checkins[0]), getCheckinLocation(checkins[1]), getCheckinLocation(checkins[0]), true),
            createCheckinEvent(checkins[1]),
            createCheckinEvent(checkins[2]),
            createCheckinEvent(checkins[3]),
        ]
        assert.deepEqual(events, expectedEvents)
    })
    it('should create guess bus transport event with city change to airport and small distance', function () {
        const checkins = chronological([restaurant_leszno, fitness_wroclaw])
        const events = createTimelineEvents({ checkins })
        const expectedEvents = [
            createCheckinEvent(checkins[0]),
            createTransportEvent(TransportMode.Car, getCheckinDate(checkins[0]), getCheckinLocation(checkins[1]), getCheckinLocation(checkins[0]), true),
            createCheckinEvent(checkins[1]),
        ]
        assert.deepEqual(events, expectedEvents)
    })
    // TODO: BUS/TRAIN/CAR mix based on change in city sizes (small-to-small city is almost always a car trip)
    // TODO: Add ship transport (probably some cargo categories available)
    // TODO: Add context: BIKE/BICYCLE owner with long distance travels
})