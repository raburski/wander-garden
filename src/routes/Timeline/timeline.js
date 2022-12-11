import { createTimelineEvents } from './timeline.events'
import { createTimelineGroups } from './timeline.groups'
import { getPotentialHomes } from '../../swarm/functions'

export default function createTimeline(checkins, config) {
    const homes = getPotentialHomes(checkins)
    const events = createTimelineEvents(checkins)
    const context = { homes }
    return createTimelineGroups(events, context, config)
}