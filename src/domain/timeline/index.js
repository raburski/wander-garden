import { createTimelineEvents } from './events'
import { createTimelineGroups } from './groups'
export * from './Context'

export default function createTimeline(checkins, homes, config) {
    const context = { homes }
    const events = createTimelineEvents(checkins, context)
    return createTimelineGroups(events, context, config)
}