import assert from 'assert'
import moment from 'moment'
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
        const fitnessCheckin = { ...fitness_wroclaw, createdAt: moment().unix()}
        const trainstationCheckin = { ...trainstation_krakow, createdAt: moment().subtract(1, 'day').unix()}
        const checkins = [fitnessCheckin, trainstationCheckin]
        const events = createTimelineEvents(checkins)
        const expectedEvents = [
            createCheckinEvent(fitnessCheckin),
            createTransportEvent(TransportMode.Train, getCheckinDate(trainstationCheckin), getCheckinLocation(trainstationCheckin), getCheckinLocation(fitnessCheckin)),
            createCheckinEvent(trainstationCheckin),
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