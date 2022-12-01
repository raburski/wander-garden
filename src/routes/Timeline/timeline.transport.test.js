import assert from 'assert'
import { createTimelineEvents, createCheckinEvent, createTransportEvent, getCheckinLocation, TRANSPORT_MODE } from './timeline'
import { fitness_wroclaw, restaurant_leszno, airport_lombardy, tearoom_stezzano } from './testData'

describe('timeline @ transport', function () {
    it('should create guess car transport event with any other city change but smaller distance than plane flight', function () {
        const checkins = [restaurant_leszno, fitness_wroclaw]
        const events = createTimelineEvents(checkins)
        const expectedEvents = [
            createCheckinEvent(restaurant_leszno),
            createTransportEvent(TRANSPORT_MODE.CAR, getCheckinLocation(fitness_wroclaw), getCheckinLocation(restaurant_leszno), true),
            createCheckinEvent(fitness_wroclaw),
        ]
        assert.deepEqual(events, expectedEvents)
    })
    it('should create guess bus transport event with city change from airport and small distance', function () {
        const checkins = [tearoom_stezzano, airport_lombardy]
        const events = createTimelineEvents(checkins)
        const expectedEvents = [
            createCheckinEvent(tearoom_stezzano),
            createTransportEvent(TRANSPORT_MODE.BUS, getCheckinLocation(airport_lombardy), getCheckinLocation(tearoom_stezzano), true),
            createCheckinEvent(airport_lombardy),
        ]
        assert.deepEqual(events, expectedEvents)
    })
    it('should create guess bus transport event with city change to airport and small distance', function () {
        const checkins = [airport_lombardy, tearoom_stezzano]
        const events = createTimelineEvents(checkins)
        const expectedEvents = [
            createCheckinEvent(airport_lombardy),
            createTransportEvent(TRANSPORT_MODE.BUS, getCheckinLocation(tearoom_stezzano), getCheckinLocation(airport_lombardy), true),
            createCheckinEvent(tearoom_stezzano),
        ]
        assert.deepEqual(events, expectedEvents)
    })
    // TODO: BUS/TRAIN/CAR mix based on change in city sizes (small-to-small city is almost always a car trip)
    // TODO: Add ship transport (probably some cargo categories available)
    // TODO: Add context: BIKE/BICYCLE owner with long distance travels
})