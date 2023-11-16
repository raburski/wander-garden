import Panel from '../../components/Panel'
import { useRef } from 'react'
import Map, { Icon } from 'domain/map'
import { venueEmoji } from 'domain/swarm/categories'
import { getDaysAndRangeText } from 'date'
import moment from 'moment'
import { LocationAccuracy } from 'domain/location'
import { ErrorBoundary } from 'react-error-boundary'
import ErrorFallback from 'components/ErrorFallback'

function getInfoWindowProperties({ stay, checkin }) {
    if (stay) {
        const [_, range] = getDaysAndRangeText(stay?.since, stay?.until)
        return {
            ariaLabel: stay?.accomodation?.name,
            content: `<b>${stay?.accomodation?.name}</b> ${stay?.url ? `<a href="${stay?.url}" target="_blank">[🔗]</a>` : ''}</br>${range}`
        }
    } else if (checkin) {
        const date = moment.unix(checkin.createdAt).format('DD/MM/YYYY HH:mm')
        const emoji = checkin?.venue ? venueEmoji(checkin?.venue) : ''
        return {
            ariaLabel: checkin?.venue?.name,
            content: `<b>${emoji} ${checkin?.venue?.name}</b></br>${date}`
        }
    } else {
        return {}
    }
}

export default function TripMap({ trip, checkins = [], style = {}, mapRef, highlightedPhase }) {
    const infoWindow = useRef()
    const stays = trip ? trip.phases.filter(phase => phase.stay && (!phase.stay.location.accuracy || phase.stay.location.accuracy === LocationAccuracy.GPS)).map(p => p.stay) : null
    const markers = [
        ...stays.map(stay => ({ stay, position: stay.location, icon: Icon.Default })),
        ...checkins.map(checkin => ({ checkin, position: checkin?.venue?.location, icon: Icon.OrangeDot }))
    ]
    const initPositions = stays.length > 0 ? stays.map(s => s.location) : checkins.map(c => c?.venue?.location)
    const highlightedStayIndex = highlightedPhase ? stays.findIndex(stay => highlightedPhase.stay.id === stay.id) : undefined

    const onResetView = () => {
        const map = mapRef.current
        map.fitBoundsToPositions(initPositions)
    }

    const onMarkerClick = (markerData, marker, map, google) => {
        if (infoWindow.current) {
            infoWindow.current.close()
        }
        infoWindow.current = new google.maps.InfoWindow(getInfoWindowProperties(markerData))
        infoWindow.current.open({
            anchor: marker,
            map,
        })
    }

    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Panel style={{flex: 1, alignSelf: 'stretch', flexShrink: 2, ...style }} contentStyle={{ flex: 1, display: 'flexbox', alignSelf: 'stretch'}}>
                <Map
                    mapRef={mapRef}
                    initPositions={initPositions}
                    markers={markers}
                    onMarkerClick={onMarkerClick}
                    bouncingMarkerIndex={highlightedStayIndex}
                    onResetView={onResetView}
                />
            </Panel>
        </ErrorBoundary>
    )
}