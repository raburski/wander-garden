import moment from 'moment'
import { _checkins, _movies } from './swarm/singletons'

export const TYPE = {
    CHECKIN: 'CHECKIN',
    WATCH: 'WATCH',
    PLAY: 'PLAY',
}

export const SOURCE = {
    SWARM: 'SWARM',
    NETFLIX: 'NETFLIX',
    YOUTUBE: 'YOUTUBE',
    STEAM: 'STEAM',
}

function checkinEventFromSwarmCheckin(checkin) {
    return {
        ...checkin,
        id: `swarm:${checkin.id}`,
        type: TYPE.CHECKIN,
        source: SOURCE.SWARM,
        date: moment.unix(checkin.createdAt).utcOffset(checkin.timeZoneOffset).format(),
    }
}

function movieDetailsFromTitle(title) {
    const seriesWithChapterNumber = /^(.+)\: (Season|Part|Chapter) ([0-9]+)\: (.+)$/gi
    const seriesWithChapterWord = /^(.+)\: (Season|Part|Chapter) ([^\:]+)\: (.+)$/gi
    const limitedSeries = /^(.+)\: (Limited Series)()\: (.+)$/gi
    const components = seriesWithChapterNumber.exec(title)
        || seriesWithChapterWord.exec(title)
        || limitedSeries.exec(title)

    if (components) {
        return {
            title: components[1],
            season: [components[2], components[3]].filter(Boolean).join(' '),
            episode: components[4],
        }
    } 
    return { title }
}

function watchEventFromNetflixMovie(movie) {
    return {
        ...movieDetailsFromTitle(movie.title),
        id: `netflix:${movie.title}`, // perhaps use SHA later
        type: TYPE.WATCH,
        source: SOURCE.NETFLIX,
        date: moment(movie.date, "DD/MM/YYYY").format(),
    }
}

class EventSource {
    get(types = [TYPE.CHECKIN, TYPE.WATCH, TYPE.PLAY]) {
        const _types = Array.isArray(types) ? types : [types]
        return [
            ...(_types.includes(TYPE.CHECKIN) ? _checkins.get().map(checkinEventFromSwarmCheckin) : []),
            ...(_types.includes(TYPE.WATCH) ? _movies.get().map(watchEventFromNetflixMovie) : []),
        ].sort((a, b) => moment(a.date).isBefore(moment(b.date)) ? 1 : -1)
    }
}

const eventSource = new EventSource()

export default eventSource