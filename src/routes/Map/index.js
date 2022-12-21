import { styled } from "goober"
import { useRef, useState, useEffect } from 'react'
import Page from '../../components/Page'
import Panel from '../../components/Panel'
import mapboxgl from 'mapbox-gl'
import { useCheckins } from '../../swarm'
import { onlyUnique } from '../../array'
import { onlyNonTransportation } from '../../swarm/categories'
import colors from "../../colors"

function Map() {
    const [checkins] = useCheckins()
    const countryCodes = checkins.filter(onlyNonTransportation).map(checkin => checkin.venue.location.cc.toUpperCase()).filter(onlyUnique)
    const mapContainer = useRef(null)
    const map = useRef(null)
    const [lng, setLng] = useState(17.0307878896155172)
    const [lat, setLat] = useState(51.1099214586825)
    const [zoom, setZoom] = useState(3)
    useEffect(() => {
        if (map.current) return; // initialize map only once
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/light-v11',
            center: [lng, lat],
            zoom: zoom
        });
        map.current.on('load', function() {
            map.current.addLayer(
              {
                id: 'country-boundaries',
                source: {
                  type: 'vector',
                  url: 'mapbox://mapbox.country-boundaries-v1',
                },
                'source-layer': 'country_boundaries',
                type: 'fill',
                paint: {
                  'fill-color': colors.neutral.normal,
                  'fill-opacity': 0.5,
                },
              },
              'country-label'
            );
            map.current.setFilter('country-boundaries', [
                "in",
                "iso_3166_1",
                ...countryCodes
              ]);
        });
    })
    return <div ref={mapContainer} style={{display: 'flexbox', flex: 1, alignSelf: 'stretch'}}/>
}

export default function Context() {
    return (
        <Page header="Map">
            <Panel contentStyle={{height: '80vh'}}>
                <Map />
            </Panel>
        </Page>
    )
}