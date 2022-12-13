import { createTimelineEvents } from './timeline.events'
import { createTimelineGroups } from './timeline.groups'
import { getPotentialHomes } from '../../swarm/functions'

export default function createTimeline(checkins, config) {
    const homes = getPotentialHomes(checkins)
    const context = { homes }
    const events = createTimelineEvents(checkins, context)
    return createTimelineGroups(events, context, config)
}