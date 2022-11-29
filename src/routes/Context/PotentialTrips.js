import { onlyNonGrocery, onlyNonTransportation } from '../../swarm/categories'
import { TYPE, useEvents } from '../../events'
import { styled } from "goober"
import moment from 'moment'
import NoneFound from './NoneFound'

// Converts numeric degrees to radians
function toRad(Value) {
    return Value * Math.PI / 180;
}

//This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
function getDistance(lat1, lon1, lat2, lon2) {
    var R = 6371; // km
    var dLat = toRad(lat2-lat1);
    var dLon = toRad(lon2-lon1);
    var lat1 = toRad(lat1);
    var lat2 = toRad(lat2);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c;
    return d;
}


function getPotentialTrips() {
    return []
}

function Trip({ trip }) {
    return <div>{JSON.stringify(trip)}</div>
}

export default function PotentialTrips() {
    const events = useEvents(TYPE.CHECKIN)//.filter(onlyNonGrocery).filter(onlyNonTransportation)
    const potentialTrips = getPotentialTrips(events)

    return (
        <div>
            <h3>Your latest trips</h3>
            {potentialTrips.length > 0 ? potentialTrips.map(trip => <Trip trip={trip} />) : <NoneFound />}
        </div>
    )
}