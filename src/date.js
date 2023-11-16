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

export function getDaysFromRange(since, until) {
    const start = moment(since).startOf('day')
    const end = moment(until).startOf('day')
    const numberOfDays = end.diff(start, 'days')
    return Array.from({length: numberOfDays}, (_, i) => moment(since).add(i, 'days').format())
}

export function isDateBetween(date, start, end) {
  return date.isSameOrAfter(start, 'day') && date.isSameOrBefore(end, 'day')
}

export function getDateRanges(dates) {
    // Sort the dates in ascending order
    const sortedDates = dates
        .map(date => moment(date))
        .sort((a, b) => a.diff(b))
  
    const dateRanges = [];
    let rangeStart = null;
    let rangeEnd = null;
  
    sortedDates.forEach((date, index) => {
      const currentDate = date
  
      if (rangeStart === null) {
        // Start a new range
        rangeStart = currentDate;
        rangeEnd = currentDate;
      } else {
        // const nextDate = sortedDates[index + 1]
  
        if (currentDate.diff(rangeEnd, 'days') === 1) {
          // Extend the range if the next date is adjacent
          rangeEnd = currentDate;
        } else {
          // Add the current range and start a new one
          dateRanges.push({
            since: rangeStart.format(),
            until: rangeEnd.add(1, 'day').format()
          });
  
          rangeStart = currentDate;
          rangeEnd = currentDate;
        }
      }
    })

    if (rangeStart && rangeEnd) {
        dateRanges.push({
            since: rangeStart.format(),
            until: rangeEnd.add(1, 'day').format()
        })
    }
  
    return dateRanges
}