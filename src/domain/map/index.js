import Button from "components/Button";
import { styled } from "goober";
import { useEffect, useRef, forwardRef, useImperativeHandle } from "react"
import { MdOutlineGridView } from "react-icons/md"
import useMapsStyles from "./useMapStyles"

export { default as MapProvider } from './Provider'

export const Icon = {
    Default: 'default',
    OrangeDot: 'orangeDot',
}

const ResetViewButton = styled(Button)`
    position: absolute;
    bottom: 34px;
    margin-left: 8px;
    font-size: 33px;
`

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



const MapComponent = forwardRef(function MyMapComponent({ markers, initPositions, bouncingMarkerIndex, onMarkerClick }, outerRef) {
    const ref = useRef()
    const mapRef = useRef()
    const currentMarkerIndex = useRef(undefined)
    const markersRef = useRef()
    const styles = useMapsStyles()

    function getZoomAndBounds(forPositions) {
        const MIN_ZOOM = 13
        const MAP_PADDING = 32
        const mapDimensions = { width: ref.current.offsetWidth - MAP_PADDING * 2, height: ref.current.offsetHeight - MAP_PADDING * 2 }
        
        const bounds = new window.google.maps.LatLngBounds()
        forPositions.forEach(position => bounds.extend(position))
        const center = bounds.getCenter()
        const zoom = Math.min(MIN_ZOOM, getBoundsZoomLevel(bounds, mapDimensions))
        return { center, zoom }
    }
  
    useEffect(() => {
        const google = window.google
        if (!google) return

        const { center, zoom } = getZoomAndBounds(initPositions)

        const map = new google.maps.Map(ref.current, {
            center,
            zoom,
            controlSize: 26,
            backgroundColor: 'none',
            styles,
        })

        const _markers = markers.map(marker => {
            const mapMarker = new google.maps.Marker({
                position: marker.position,
                label: {
                    text: marker.emoji,
                    className: marker.icon === Icon.OrangeDot ? 'marker-label-orange' : 'marker-label-blue',
                }
            })
            if (onMarkerClick) {
                mapMarker.addListener("click", () => {
                    onMarkerClick(marker, mapMarker, map, google)
                })
            }
            return mapMarker
        })

        _markers.forEach(marker => marker.setMap(map))
        markersRef.current = _markers
        mapRef.current = map
    }, [])

    useEffect(() => {
        if (!mapRef.current) return
        mapRef.current.setOptions({ styles })
    }, [styles])

    useEffect(() => {
        const markers = markersRef.current
        if (!markers || markers.length < bouncingMarkerIndex || bouncingMarkerIndex < 0) return
        if (bouncingMarkerIndex === undefined) return
        if (currentMarkerIndex.current !== undefined && currentMarkerIndex.current < markers.length) {
            markers[currentMarkerIndex.current].setAnimation(null)
        }

        markers[bouncingMarkerIndex].setAnimation(window.google.maps.Animation.BOUNCE)
        currentMarkerIndex.current = bouncingMarkerIndex

    }, [bouncingMarkerIndex])

    useImperativeHandle(outerRef, () => ({
        getMap: () => mapRef.current,
        fitBoundsToPositions: (positions) => {
            const { zoom, center } = getZoomAndBounds(positions)
            mapRef.current.panTo(center)
            mapRef.current.setZoom(zoom, true)
        }
    }), [])

  
    return <div ref={ref} id="map" style={{display: 'flex', flex: 1, alignSelf: 'stretch', backgroundColor: 'transparent'}}/>
})

export default function GoogleMaps({ mapRef, onResetView, ...props }) {
    return (
        <>
            <MapComponent ref={mapRef} {...props}/>
            {onResetView ? <ResetViewButton icon={MdOutlineGridView} iconSize={22} onClick={onResetView} /> : null}
        </>
    )
}