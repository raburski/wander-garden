import assert from 'assert'
import moment from 'moment'
import { createCheckinEvent, createTransportEvent } from './timeline.events'
import { createPhasesWithEvents } from './timeline.groups'
import { undefined_city_cyprus, airport_cyprus, fitness_wroclaw, restaurant_limassol_cyprus, restaurant_pafos_cyprus, car_mop } from './testData'
import { getCheckinDate, getCheckinLocation } from '../../domain/swarm/functions'
import { TransportMode } from './types'

describe('timeline @ phases', function () {
    it('should create phases from events', function () {
        const tripEvents = [
            createCheckinEvent(restaurant_limassol_cyprus),
            createCheckinEvent(restaurant_pafos_cyprus),
            createCheckinEvent(airport_cyprus),
            createTransportEvent(TransportMode.Plane, getCheckinDate(airport_cyprus), getCheckinLocation(fitness_wroclaw), getCheckinLocation(airport_cyprus))
        ]
        const phases = createPhasesWithEvents(tripEvents)
        const expectedPhases = [
            createCheckinEvent(restaurant_limassol_cyprus),
            createCheckinEvent(airport_cyprus),
            createTransportEvent(TransportMode.Plane, getCheckinDate(airport_cyprus), getCheckinLocation(fitness_wroclaw), getCheckinLocation(airport_cyprus))
        ]
        assert.deepEqual(phases, expectedPhases)
    })
    it('should merge car trip phases when stopping on MOP', function () {
        // TODO: Mark MOP stop within car trip and with icon
        const tripEvents = [
            createTransportEvent(TransportMode.Car, getCheckinDate(car_mop.checkin), getCheckinLocation(car_mop.checkin), getCheckinLocation(restaurant_limassol_cyprus)),
            car_mop,
            createTransportEvent(TransportMode.Car, getCheckinDate(airport_cyprus), getCheckinLocation(airport_cyprus), getCheckinLocation(car_mop.checkin)),
            createCheckinEvent(airport_cyprus),
            createTransportEvent(TransportMode.Car, getCheckinDate(fitness_wroclaw), getCheckinLocation(fitness_wroclaw), getCheckinLocation(airport_cyprus))
        ]
        const phases = createPhasesWithEvents(tripEvents)
        const expectedPhases = [
            createTransportEvent(TransportMode.Car, getCheckinDate(airport_cyprus), getCheckinLocation(airport_cyprus), getCheckinLocation(restaurant_limassol_cyprus), true),
            createCheckinEvent(airport_cyprus),
            createTransportEvent(TransportMode.Car, getCheckinDate(fitness_wroclaw), getCheckinLocation(fitness_wroclaw), getCheckinLocation(airport_cyprus))
        ]
        assert.deepEqual(phases, expectedPhases)
    })
    it('should omit events with no city', function () {
        const tripEvents = [
            createCheckinEvent(restaurant_limassol_cyprus),
            createCheckinEvent(undefined_city_cyprus),
            createCheckinEvent(restaurant_pafos_cyprus),
            createCheckinEvent(airport_cyprus),
        ]
        const phases = createPhasesWithEvents(tripEvents)
        const expectedPhases = [
            createCheckinEvent(restaurant_limassol_cyprus),
            createCheckinEvent(airport_cyprus),
        ]
        assert.deepEqual(phases, expectedPhases)
    })
})