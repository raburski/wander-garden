import { Wrapper as GoogleMapsWrapper } from "@googlemaps/react-wrapper"
import { useEffect, useRef } from "react"
import useMapsStyles from "./useMapStyles";

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

function MyMapComponent({ markers, bouncingMarkerIndex }) {
    const ref = useRef()
    const mapRef = useRef()
    const currentMarkerIndex = useRef(undefined)
    const markersRef = useRef()
    const styles = useMapsStyles()
  
    useEffect(() => {
        const google = window.google

        // Calculate initial zoom and center
        const MIN_ZOOM = 13
        const MAP_PADDING = 32
        const mapDimensions = { width: ref.current.offsetWidth - MAP_PADDING * 2, height: ref.current.offsetHeight - MAP_PADDING * 2 }
        const bounds = new google.maps.LatLngBounds()
        markers.forEach(marker => bounds.extend(marker.position))
        const center = bounds.getCenter()
        const zoom = Math.min(MIN_ZOOM, getBoundsZoomLevel(bounds, mapDimensions))

        const map = new google.maps.Map(ref.current, {
            center,
            zoom,
            controlSize: 26,
            backgroundColor: 'none',
            styles,
        })

        // create markers
        const _markers = markers.map(marker => {
            return new google.maps.Marker(marker)
        })

        _markers.forEach(marker => marker.setMap(map))
        markersRef.current = _markers
        mapRef.current = map
    }, [])

    useEffect(() => {
        mapRef.current.setOptions({ styles })
    }, [styles])

    useEffect(() => {
        const markers = markersRef.current
        if (!markers || markers.length < bouncingMarkerIndex) return
        if (bouncingMarkerIndex === undefined) return
        if (currentMarkerIndex.current !== undefined) {
            markers[currentMarkerIndex.current].setAnimation(null)
        }

        markers[bouncingMarkerIndex].setAnimation(window.google.maps.Animation.BOUNCE)
        currentMarkerIndex.current = bouncingMarkerIndex

    }, [bouncingMarkerIndex])
  
    return <div ref={ref} id="map" style={{display: 'flex', flex: 1, alignSelf: 'stretch', backgroundColor: 'transparent'}}/>;
}

export default function GoogleMaps(props) {
    return (
        <GoogleMapsWrapper apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
            <MyMapComponent {...props}/>
        </GoogleMapsWrapper>
    )
}