import { useTimelineGroup } from 'domain/timeline'
import { Wrapper as GoogleMapsWrapper } from "@googlemaps/react-wrapper";
import { titleFromLocationHighlights } from 'domain/timeline/groups'
import { useParams } from 'react-router'
import Page from '../../components/Page'
import Panel from '../../components/Panel'
import GroupEvent from 'routes/Timeline/GroupEvent'
import { styled } from 'goober'
import moment from 'moment'
import useTrip, { PhaseType, StayPhase } from './useTrip'
import GroupBar from 'routes/Timeline/GroupBar'
import { getDaysAndRangeText } from 'date'
import useGroups, { GroupType } from './useGroups'
import Phase from './Phase'
import { useEffect, useRef } from 'react';
import Separator from 'components/Separator';
import { Column, Row } from 'components/container';
import useMapsStyles from './useMapStyles';

const EventsContainer = styled('div')`
    display: flex;
    padding: 12px;
    flex-wrap: wrap;
    align-items: center;
`

const GroupContainer = styled('div')`
    border-bottom: 0px solid ${props => props.theme.border};
    border-top: 1px solid ${props => props.theme.border};
    margin-top: -1px;
    padding-bottom: 10px;
`

const GroupHeader = styled(GroupBar)`
    border: 0px solid;
`

function getPhaseTitle(phase) {
    return phase?.stay?.accomodation?.name
}

function getGroupTitle(group) {
    switch (group.type) {
        case GroupType.City:
            return group?.location?.city
        case GroupType.Country:
            return group?.location?.country
        case GroupType.Unknown:
            return group?.guessedLocations?.map(l => l.city).join(' or ')
        default:
            return undefined
    }
}

function Group({ group }) {
    const [days] = getDaysAndRangeText(group.since, group.until)
    // TODO: support unknown type
    // if (group.type === GroupType.Unknown) {
    //     return null
    // }
    return (
        <GroupContainer>
            <GroupHeader countryCodes={[group?.location?.cc]} title={getGroupTitle(group)} days={days}/>
            {group.phases.map(phase => <Phase phase={phase} />)}
        </GroupContainer>
    )
}


function GroupsPanel({ groups, ...props }) {
    return (
        <Panel flex {...props}>
            {groups.map(group => <Group group={group}/>)}
        </Panel>
    )
}

function getBoundsZoomLevel(bounds, mapDim) {
    var WORLD_DIM = { height: 256, width: 256 };
    var ZOOM_MAX = 21;

    function latRad(lat) {
        var sin = Math.sin(lat * Math.PI / 180);
        var radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
        return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
    }

    function zoom(mapPx, worldPx, fraction) {
        return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
    }

    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();

    var latFraction = (latRad(ne.lat()) - latRad(sw.lat())) / Math.PI;
    
    var lngDiff = ne.lng() - sw.lng();
    var lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;
    
    var latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction);
    var lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction);

    return Math.min(latZoom, lngZoom, ZOOM_MAX);
}

function MyMapComponent({ stays }) {
    const ref = useRef()
    const mapRef = useRef()
    const mapStyles = useMapsStyles()
  
    useEffect(() => {
        const google = window.google

        // Calculate initial zoom and center
        const MIN_ZOOM = 13
        const MAP_PADDING = 20
        const mapDimensions = { width: ref.current.offsetWidth - MAP_PADDING * 2, height: ref.current.offsetHeight - MAP_PADDING * 2 }
        const bounds = new google.maps.LatLngBounds()
        // TODO: Add checkin locations from the trip too
        stays.forEach(stay => bounds.extend({ lat: stay.location.lat, lng: stay.location.lng}))
        const center = bounds.getCenter()
        const zoom = Math.min(MIN_ZOOM, getBoundsZoomLevel(bounds, mapDimensions))

        const map = new google.maps.Map(ref.current, {
            center,
            zoom,
            controlSize: 26,
            backgroundColor: 'none',
            styles: mapStyles,
        })

        // create markers
        const stayMarkers = stays.map(stay => {
            return new google.maps.Marker({
                position: new google.maps.LatLng(stay.location.lat, stay.location.lng)
            })
        })

        stayMarkers.forEach(marker => marker.setMap(map))

        mapRef.current = map
    })

    useEffect(() => {
        mapRef.current.setOptions({ styles: mapStyles })
    }, [mapStyles])
  
    return <div ref={ref} id="map" style={{display: 'flex', flex: 1, alignSelf: 'stretch', backgroundColor: 'transparent'}}/>;
}

function Map({ trip, style = {} }) {
    const stays = trip ? trip.phases.map(phase => phase.type === PhaseType.Stay ? phase.stay : undefined).filter(Boolean) : []

    return (
        <Panel style={{flex: 1, alignSelf: 'stretch', flexShrink: 2, ...style }} contentStyle={{ flex: 1, display: 'flexbox', alignSelf: 'stretch'}}>
            <GoogleMapsWrapper apiKey="AIzaSyCbFg09TiWP_fS1612Ir_bP3hFqW1mizA4">
            {stays.length > 0 ? <MyMapComponent stays={stays}/> : null}
            </GoogleMapsWrapper>
        </Panel>
    )
}


export default function Trip() {
    const { id } = useParams()
    const group = useTimelineGroup(id)

    const trip = useTrip(group?.since, group?.until)
    const groups = useGroups(group?.since, group?.until)

    if (!group) { return null }

    // console.log('groups', groups)

    const header = `Trip to ${titleFromLocationHighlights(group.highlights)}`
    const leftToRightPhases = [...group.phases].reverse()

    // console.log('trip', trip)

    return (
        <Page header={header} showBackButton>
            
            <Row style={{flex:1, height: '86vh', alignItems: 'stretch', marginTop: -18}}>
                <Column style={{flex:0.7, overflowY: 'scroll', overflowX: 'hidden', minWidth: 400}}>
                    <Panel style={{paddingTop: 18}}>
                        <EventsContainer>{leftToRightPhases.map(event => <GroupEvent key={event.id} event={event}/>)}</EventsContainer>
                    </Panel>
                    <GroupsPanel header={`${moment(group?.since).format('DD/MM/YYYY')} - ${moment(group?.until).format('DD/MM/YYYY')}`} groups={groups} />
                </Column>
                <Separator />
                <Map style={{paddingTop: 18}} trip={trip}/>
            </Row>
        </Page>
    )
}