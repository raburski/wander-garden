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

export function cleanLocation(location = "") {
    const latinLocation = cyrylicToLatin(location)
    return cleanState(latinLocation)
        .toLowerCase()
        .replace(' city', '')
        .normalize('NFD')
        .replace(/([\u0300-\u036f])/g, '')
        .replace('ł', 'l')
        .replace(/(wiu)$/g, 'w')
}

export function isEqualCountry(leftCheckin, rightCheckin) {
    return leftCheckin.venue.location.country == rightCheckin.venue.location.country
}

export function isEqualCity(leftCheckin, rightCheckin) {
    return cleanLocation(leftCheckin.venue.location.city) == cleanLocation(rightCheckin.venue.location.city)
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
    const parts = [location.city, location.state, location.country].filter(Boolean)
    return parts.join(', ')
}