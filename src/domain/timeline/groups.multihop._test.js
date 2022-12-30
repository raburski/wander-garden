import assert from 'assert'
import moment from 'moment'
import { createCheckinEvent, createTransportEvent } from './events'
import { createTimelineGroups, createTripGroup, createContainerGroup } from './groups'
import { trainstation_krakow, trainstation_wroclaw, fitness_wroclaw, airport_cyprus, restaurant_limassol_cyprus, kobierzyce_trip_events } from './testData'
import { createPotentialHomeWithCheckin, getCheckinLocation, getCheckinDate } from '../swarm/functions'
import { TransportMode } from './types'

const HOME = createPotentialHomeWithCheckin(fitness_wroclaw, moment('1991-01-01'), null)
const CONTEXT = {
    homes: [
        HOME
    ]
}

describe('timeline @ multihop', function () {
    // it('should create container group with any trip starting and ending in home', function () {
    //     const homeEvent = createCheckinEvent(fitness_wroclaw)
    //     const tripEvents = [
    //         createTransportEvent(TransportMode.Plane, getCheckinDate(restaurant_limassol_cyprus),  getCheckinLocation(airport_cyprus), HOME.location),
    //         createCheckinEvent(restaurant_limassol_cyprus),
    //         createCheckinEvent(airport_cyprus),
    //         createTransportEvent(TransportMode.Plane, getCheckinDate(airport_cyprus), HOME.location, getCheckinLocation(airport_cyprus)),
    //     ]
    //     const groups = createTimelineGroups([
    //         homeEvent,
    //         ...tripEvents,
    //         homeEvent,
    //     ], CONTEXT)
    //     const expectedGroups = [
    //         createHomeGroup([homeEvent]),
    //         createTripGroup(tripEvents),
    //         createHomeGroup([homeEvent]),
    //     ]
    //     assert.deepEqual(groups, expectedGroups)
    // })

    
    // it('should create multihop group with KOBIERZYCE', function () {
    //     const tripEvents = kobierzyce_trip_events['default'] // othwerise reads it as object instead of array
    //     const groups = createTimelineGroups(tripEvents, CONTEXT)
    //     const expectedGroups = [
    //         createContainerGroup([
    //             createTripGroup(tripEvents)
    //         ]),
    //     ]
    //     console.dir(groups[0].groups,{depth:null})
    //     console.dir(expectedGroups[0].groups,{depth:null})
    //     // console.log('??? %j', groups[0].groups)
    //     // console.log('??? %j', expectedGroups[0].groups)
    //     assert.deepEqual(groups, expectedGroups)
    // })
})