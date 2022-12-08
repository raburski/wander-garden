var a = {"Ё":"YO","Й":"I","Ц":"TS","У":"U","К":"K","Е":"E","Н":"N","Г":"G","Ш":"SH","Щ":"SCH","З":"Z","Х":"H","Ъ":"'","ё":"yo","й":"i","ц":"ts","у":"u","к":"k","е":"e","н":"n","г":"g","ш":"sh","щ":"sch","з":"z","х":"h","ъ":"'","Ф":"F","Ы":"I","В":"V","А":"a","П":"P","Р":"R","О":"O","Л":"L","Д":"D","Ж":"ZH","Э":"E","ф":"f","ы":"i","в":"v","а":"a","п":"p","р":"r","о":"o","л":"l","д":"d","ж":"zh","э":"e","Я":"Ya","Ч":"CH","С":"S","М":"M","И":"I","Т":"T","Ь":"'","Б":"B","Ю":"YU","я":"ya","ч":"ch","с":"s","м":"m","и":"i","т":"t","ь":"'","б":"b","ю":"yu"}

function cyrylicToLatin(word){
  return word.split('').map(function (char) { 
    return a[char] || char
  }).join("")
}

export function cleanState(state) {
    if (state === 'Lower Silesia' || state == 'Dolnoslezské') {
        return 'Dolnośląskie'
    }
    return state.replace('Województwo ', '').replace(' Županija', '')
}

const fixNames = {
    Vrotslav: 'Wrocław',
}

export function cleanLocation(location = "") {
    const latinLocation = cyrylicToLatin(location)
    const fixedNames = fixNames[latinLocation] || latinLocation
    return cleanState(fixedNames)
        .toLowerCase()
        .replace(' city', '')
        .normalize('NFD')
        .replace(/([\u0300-\u036f])/g, '')
        .replace('ł', 'l')
        .replace(/(wiu)$/g, 'w')
}

export function isEqualApproximiteLocation(leftLocation, rightLocation, radius = 5) {
    const locationDistance = distance(leftLocation.lat, leftLocation.lng, rightLocation.lat, rightLocation.lng)
    return locationDistance <= radius
}

export function isEqualLocationCity(leftLocation, rightLocation) {
    return cleanLocation(leftLocation.city) == cleanLocation(rightLocation.city)
}

export function isEqualCountry(leftCheckin, rightCheckin) {
    return leftCheckin.venue.location.country == rightCheckin.venue.location.country
}

export function isEqualCity(leftCheckin, rightCheckin) {
    return isEqualLocationCity(leftCheckin.venue.location, rightCheckin.venue.location)
}

export function isEqualState(leftCheckin, rightCheckin) {
    return cleanLocation(leftCheckin.venue.location.state) == cleanLocation(rightCheckin.venue.location.state)
}

export function hasCity(checkin) {
    return !!checkin.venue.location.city
}

export function hasState(checkin) {
    return !!checkin.venue.location.state
}

export function formattedLocation(location) {
    const parts = [location.city, location.state === location.city ? null : location.state, location.country].filter(Boolean)
    return parts.join(', ')
}

export function distance(lat1, lon1, lat2, lon2) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    }
    else {
        var radlat1 = Math.PI * lat1/180;
        var radlat2 = Math.PI * lat2/180;
        var theta = lon1-lon2;
        var radtheta = Math.PI * theta/180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180/Math.PI;
        dist = dist * 60 * 1.1515;
        dist = dist * 1.609344 // to KM
        return dist;
    }
}

export function getCheckinLocation(checkin) {
    const location = checkin?.venue?.location
    return location ? {
        address: location.address,
        city: location.city,
        state: location.state,
        country: location.country,
        cc: location.cc,
        postalCode: location.postalCode,
        lat: location.lat,
        lng: location.lng,
    } : null
}

export function getDistanceBetweenCheckins(checkin1, checkin2) {
    const location1 = getCheckinLocation(checkin1)
    const location2 = getCheckinLocation(checkin2)
    if (!location1 || !location2) {
        return null
    }
    return distance(location1.lat, location1.lng, location2.lat, location2.lng)
}
