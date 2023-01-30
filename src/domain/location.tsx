import type { Moment } from "moment"

var a: {[cyrylic: string]: string} = {"Ё":"YO","Й":"I","Ц":"TS","У":"U","К":"K","Е":"E","Н":"N","Г":"G","Ш":"SH","Щ":"SCH","З":"Z","Х":"H","Ъ":"'","ё":"yo","й":"i","ц":"ts","у":"u","к":"k","е":"e","н":"n","г":"g","ш":"sh","щ":"sch","з":"z","х":"h","ъ":"'","Ф":"F","Ы":"I","В":"V","А":"a","П":"P","Р":"R","О":"O","Л":"L","Д":"D","Ж":"ZH","Э":"E","ф":"f","ы":"i","в":"v","а":"a","п":"p","р":"r","о":"o","л":"l","д":"d","ж":"zh","э":"e","Я":"Ya","Ч":"CH","С":"S","М":"M","И":"I","Т":"T","Ь":"'","Б":"B","Ю":"YU","я":"ya","ч":"ch","с":"s","м":"m","и":"i","т":"t","ь":"'","б":"b","ю":"yu"}

export interface Location {
    address?: string
    city: string
    state?: string
    country: string
    cc: string
    postalCode?: string
    lat: number
    lng: number
}

export interface Home {
    location: Location
    since?: string
    until?: string
}

function cyrylicToLatin(word: string){
  return word.split('').map(function (char: string) { 
    return a[char] || char
  }).join("")
}

export function cleanState(state: string) {
    if (state === 'Lower Silesia' || state == 'Dolnoslezské') {
        return 'Dolnośląskie'
    }
    return state.replace('Województwo ', '').replace(' Županija', '')
}

const fixNames: {[name: string]: string} = {
    Vrotslav: 'Wrocław',
    Vratislav: 'Wrocław',
    Wroclawiu: 'Wrocław',
    Wroclaw: 'Wrocław',

    Krakow: 'Kraków',
    'Budapest VIII. kerület': 'Budapest'
}

export function cleanLocation(location: string = "") {
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

export function isEqualApproximiteLocation(leftLocation: Location, rightLocation: Location, radius: number = 15) {
    const locationDistance = distance(leftLocation.lat, leftLocation.lng, rightLocation.lat, rightLocation.lng)
    return locationDistance <= radius
}

export function isEqualLocationCity(leftLocation: Location, rightLocation: Location) {
    return cleanLocation(leftLocation.city) == cleanLocation(rightLocation.city)
}

export function isEqualLocationCountry(leftLocation: Location, rightLocation: Location) {
    return cleanLocation(leftLocation.country) == cleanLocation(rightLocation.country)
}

const STATE_AS_CITY: {[state: string]: string} = {
    // TODO: add more of these and allow user to define it themselves
    'Greater London': 'London',
}

export function isEqualMetro(leftLocation: Location, rightLocation: Location): boolean {
    const leftCity = cleanLocation(leftLocation.city)
    const rightCity = cleanLocation(rightLocation.city)
    const leftState = cleanLocation(leftLocation.state)
    const rightState = cleanLocation(rightLocation.state)
    const leftMetroCity = cleanLocation(STATE_AS_CITY[leftState])
    const rightMetroCity = cleanLocation(STATE_AS_CITY[rightState])
    if (leftCity === rightState || leftState === rightCity) {
        return true
    } else if (leftMetroCity && rightMetroCity && leftMetroCity === rightMetroCity) {
        return true
    } else if (leftMetroCity && leftMetroCity === rightCity) {
        return true
    } else if (rightMetroCity && rightMetroCity === leftCity) {
        return true
    }
    return false
}

export function isTheSameArea(leftLocation: Location, rightLocation: Location) {
    const equalCity = (leftLocation.city && rightLocation.city) ? isEqualLocationCity(leftLocation, rightLocation) : false
    const equalMetro = isEqualMetro(leftLocation, rightLocation)
    const approximateLocation = isEqualApproximiteLocation(leftLocation, rightLocation)
    return equalCity || equalMetro || approximateLocation
}

export function formattedLocation(location: Location) {
    const parts = [location.city, location.state === location.city ? null : location.state, location.country].filter(Boolean)
    return parts.join(', ')
}

export function distance(lat1: number, lon1: number, lat2: number, lon2: number) {
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
