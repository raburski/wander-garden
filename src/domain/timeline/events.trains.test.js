import assert from 'assert'
import moment from 'moment'
import { createTimelineEvents, createCheckinEvent, createTransportEvent } from './events'
import { trainstation_krakow, trainstation_wroclaw, fitness_wroclaw } from './testData'
import { getCheckinDate, getCheckinLocation } from '../swarm/functions'
import { TransportMode } from './types'
import { chronological } from './testing'

describe('timeline @ trains', function () {
    it('should create train transport event with destination train station', function () {
        const checkins = chronological([trainstation_krakow, fitness_wroclaw])
        const events = createTimelineEvents({ checkins })
        const expectedEvents = [
            createCheckinEvent(checkins[0]),
            createTransportEvent(TransportMode.Train, getCheckinDate(checkins[0]), getCheckinLocation(checkins[1]), getCheckinLocation(checkins[0])),
            createCheckinEvent(checkins[1]),
        ]
        assert.deepEqual(events, expectedEvents)
    })
    it('should create train transport event with departure train station', function () {
        const fitnessCheckin = { ...fitness_wroclaw, createdAt: moment().unix()}
        const trainstationCheckin = { ...trainstation_krakow, createdAt: moment().subtract(1, 'day').unix()}
        const checkins = [fitnessCheckin, trainstationCheckin]
        const events = createTimelineEvents({ checkins })
        const expectedEvents = [
            createCheckinEvent(fitnessCheckin),
            createTransportEvent(TransportMode.Train, getCheckinDate(trainstationCheckin), getCheckinLocation(trainstationCheckin), getCheckinLocation(fitnessCheckin)),
            createCheckinEvent(trainstationCheckin),
        ]
        assert.deepEqual(events, expectedEvents)
    })
    it('should create train transport event with both train stations', function () {
        const checkins = chronological([trainstation_wroclaw, trainstation_krakow])
        const events = createTimelineEvents({ checkins })
        const expectedEvents = [
            createCheckinEvent(checkins[0]),
            createTransportEvent(TransportMode.Train, getCheckinDate(checkins[0]), getCheckinLocation(checkins[1]), getCheckinLocation(checkins[0])),
            createCheckinEvent(checkins[1]),
        ]
        assert.deepEqual(events, expectedEvents)
    })
    // TODO: Add guess train transport when long distance between major city centers
})