import moment from 'moment'

export function checkinDaysBefore(checkin, daysBefore = 0) {
    return {
        ...checkin,
        createdAt: moment('1991-06-15T00:00:00').subtract(daysBefore, 'days').unix(),
    }
}

export function chronological(array) {
    return array.map((checkin, i) => checkinDaysBefore(checkin, i))
}