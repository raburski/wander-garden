import assert from 'assert'
import moment from 'moment'
import { createCheckinEvent, createTransportEvent, getCheckinLocation, TRANSPORT_MODE } from './timeline.events'
import { createTimelineGroups, createMultihopGroup, createHomeGroup } from './timeline.groups'
import { trainstation_krakow, trainstation_wroclaw, fitness_wroclaw, airport_cyprus, restaurant_limassol_cyprus, kobierzyce_trip_events } from './testData'
import { createPotentialHomeWithCheckin, getCheckinDate } from '../../swarm/functions'

const HOME = createPotentialHomeWithCheckin(fitness_wroclaw, moment('1991-01-01'), null)
const CONTEXT = {
    homes: [
        HOME
    ]
}

describe('timeline @ multihop', function () {
    // it('should create multihop group with any trip starting and ending in home', function () {
    //     const homeEvent = createCheckinEvent(fitness_wroclaw)
    //     const tripEvents = [
    //         createTransportEvent(TRANSPORT_MODE.PLANE, getCheckinDate(restaurant_limassol_cyprus),  getCheckinLocation(airport_cyprus), HOME.location),
    //         createCheckinEvent(restaurant_limassol_cyprus),
    //         createCheckinEvent(airport_cyprus),
    //         createTransportEvent(TRANSPORT_MODE.PLANE, getCheckinDate(airport_cyprus), HOME.location, getCheckinLocation(airport_cyprus)),
    //     ]
    //     const groups = createTimelineGroups([
    //         homeEvent,
    //         ...tripEvents,
    //         homeEvent,
    //     ], CONTEXT)
    //     const expectedGroups = [
    //         createHomeGroup([homeEvent]),
    //         createMultihopGroup(tripEvents),
    //         createHomeGroup([homeEvent]),
    //     ]
    //     assert.deepEqual(groups, expectedGroups)
    // })
    it('should create multihop group with KOBIERZYCE', function () {
        const tripEvents = kobierzyce_trip_events['default'] // othwerise reads it as object instead of array
        const groups = createTimelineGroups(tripEvents, CONTEXT)
        const expectedGroups = [
            createMultihopGroup(tripEvents),
        ]
        assert.deepEqual(groups, expectedGroups)
    })
})