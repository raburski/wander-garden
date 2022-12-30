import assert from 'assert'
import moment from 'moment'
import { createCheckinEvent, createTransportEvent } from './events'
import { createTimelineGroups, createTripGroup, createContainerGroup, getHighlightsFromEvents } from './groups'
import { airport_cyprus, trainstation_wroclaw, fitness_wroclaw, burger_berlin, restaurant_limassol_cyprus, restaurant_pafos_cyprus, karpacz_events, krakow_events, germany_swiss_trip_events, cafe_nicosia_cyprus, srilanka_trip_events, eurotrip } from './testData'
import { createPotentialHomeWithCheckin, getCheckinLocation, getCheckinDate } from '../swarm/functions'
import { TransportMode, LocationHighlightType } from './types'


describe('timeline group title', function () {
    it('should recognise city trips', function () {
        const events = [
            createTransportEvent(TransportMode.Train, getCheckinDate(burger_berlin), burger_berlin, trainstation_wroclaw),
            createCheckinEvent(burger_berlin),
            createTransportEvent(TransportMode.Train, getCheckinDate(trainstation_wroclaw), trainstation_wroclaw, burger_berlin)
        ]
        const highlights = getHighlightsFromEvents(events)
        const expectedHighlights = [{ type: LocationHighlightType.City, location: getCheckinLocation(burger_berlin) }]
        assert.deepEqual(highlights, expectedHighlights)
    })
    it('should recognise country trips', function () {
        const events = [
            createTransportEvent(TransportMode.Plane, getCheckinDate(cafe_nicosia_cyprus), cafe_nicosia_cyprus, fitness_wroclaw),
            createCheckinEvent(cafe_nicosia_cyprus),
            createCheckinEvent(restaurant_limassol_cyprus),
            createCheckinEvent(restaurant_pafos_cyprus),
            createCheckinEvent(airport_cyprus),
            createTransportEvent(TransportMode.Plane, getCheckinDate(fitness_wroclaw), fitness_wroclaw, airport_cyprus)
        ]
        const highlights = getHighlightsFromEvents(events)
        const expectedHighlights = [{ type: LocationHighlightType.Country, location: getCheckinLocation(cafe_nicosia_cyprus) }]
        assert.deepEqual(highlights, expectedHighlights)
    })
    it('should recognise regional trips', function () {
        const dolnoslaskieCheckinEvent = karpacz_events['default'][3]
        const events = karpacz_events['default']
        const highlights = getHighlightsFromEvents(events)
        const expectedHighlights = [{ type: LocationHighlightType.State, location: dolnoslaskieCheckinEvent.location }]
        assert.deepEqual(highlights, expectedHighlights)
    })
    it('should recognise most checked in city/region', function () {
        const krakowCheckinEvent = krakow_events['default'][4]
        const events = krakow_events['default']
        const highlights = getHighlightsFromEvents(events)
        const expectedHighlights = [{ type: LocationHighlightType.City, location: krakowCheckinEvent.location }]
        assert.deepEqual(highlights, expectedHighlights)
    })
    it('should recognise most checked in city/region', function () {
        const krakowCheckinEvent = krakow_events['default'][4]
        const events = krakow_events['default']
        const highlights = getHighlightsFromEvents(events)
        const expectedHighlights = [{ type: LocationHighlightType.City, location: krakowCheckinEvent.location }]
        assert.deepEqual(highlights, expectedHighlights)
    })
    it('should recognise country if multiple regions from given country', function () {
        const srilankaCheckinEvent = srilanka_trip_events['default'][6]
        const events = srilanka_trip_events['default']
        const highlights = getHighlightsFromEvents(events)
        const expectedHighlights = [{ type: LocationHighlightType.Country, location: srilankaCheckinEvent.location }]
        assert.deepEqual(highlights, expectedHighlights)
    })
})