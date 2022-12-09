import assert from 'assert'
import { createTimelineEvents, createCheckinEvent, createTransportEvent } from './timeline.events'
import { trainstation_krakow, trainstation_wroclaw, fitness_wroclaw } from './testData'
import { getCheckinDate, getCheckinLocation } from '../../swarm/functions'
import { TransportMode } from './types'

describe('timeline @ trains', function () {
    it('should create train transport event with destination train station', function () {
        const checkins = [trainstation_krakow, fitness_wroclaw]
        const events = createTimelineEvents(checkins)
        const expectedEvents = [
            createCheckinEvent(trainstation_krakow),
            createTransportEvent(TransportMode.Train, getCheckinDate(trainstation_krakow), getCheckinLocation(fitness_wroclaw), getCheckinLocation(trainstation_krakow)),
            createCheckinEvent(fitness_wroclaw),
        ]
        assert.deepEqual(events, expectedEvents)
    })
    it('should create train transport event with departure train station', function () {
        const checkins = [fitness_wroclaw, trainstation_krakow]
        const events = createTimelineEvents(checkins)
        const expectedEvents = [
            createCheckinEvent(fitness_wroclaw),
            createTransportEvent(TransportMode.Train, getCheckinDate(trainstation_krakow), getCheckinLocation(trainstation_krakow), getCheckinLocation(fitness_wroclaw)),
            createCheckinEvent(trainstation_krakow),
        ]
        assert.deepEqual(events, expectedEvents)
    })
    it('should create train transport event with both train stations', function () {
        const checkins = [trainstation_wroclaw, trainstation_krakow]
        const events = createTimelineEvents(checkins)
        const expectedEvents = [
            createCheckinEvent(trainstation_wroclaw),
            createTransportEvent(TransportMode.Train, getCheckinDate(trainstation_wroclaw), getCheckinLocation(trainstation_krakow), getCheckinLocation(trainstation_wroclaw)),
            createCheckinEvent(trainstation_krakow),
        ]
        assert.deepEqual(events, expectedEvents)
    })
    // TODO: Add guess train transport when long distance between major city centers
})