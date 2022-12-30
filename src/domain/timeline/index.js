import { createTimelineEvents } from './events'
import { createTimelineGroups } from './groups'
import { getPotentialHomes } from 'domain/swarm/functions'

export default function createTimeline(checkins, config) {
    const homes = getPotentialHomes(checkins)
    const context = { homes }
    const events = createTimelineEvents(checkins, context)
    return createTimelineGroups(events, context, config)
}