import moment from 'moment'

const MONTH_TO_SEASON = ['❄️', '❄️', '🌸', '🌸', '🌸', '☀️', '☀️', '☀️', '🍁', '🍁', '🍁', '❄️']
export function seasonEmojiForDate(date) {
    const month = date.get('month') // index from 0
    return MONTH_TO_SEASON[month]
}

export function getDaysAndRangeText(_since, _until) {
    const until = moment(_until).startOf('day')
    const since = moment(_since).startOf('day')
    const numberOfDays = until.diff(since, 'days')
    const daysSuffix = numberOfDays === 1 ? 'day' : 'days'
    const days = `${numberOfDays} ${daysSuffix}`
    const season = seasonEmojiForDate(moment(_since).add(numberOfDays/2, 'days'))
    const range = `${since.format('DD.MM')} - ${until.format('DD.MM')} ${season}`
    return [days, range]
}

export function getFormattedDate(string) {
    const date = moment(string)
    const season = seasonEmojiForDate(date)
    return `${date.format('DD.MM.YYYY')} ${season}`
}