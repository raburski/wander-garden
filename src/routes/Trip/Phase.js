import { getDaysAndRangeText } from 'date'
import PhaseLine from './PhaseLine'
import { PhaseType } from './useTrip'

const UNKNOWN_EMOJI = '❓'

function UnknownPhaseLine({ phase, ...props }) {
    const [days, range] = getDaysAndRangeText(phase.since, phase.until)
    return (
        <PhaseLine emoji={UNKNOWN_EMOJI} style={{marginTop: 10}} title={`Where did you stay for ${days}?`} range={range} {...props} />
    )
}

function getPhaseTitle(phase) {
    return phase?.stay?.accomodation?.name
}

const STAY_EMOJI = '🛌'

export default function Phase({ phase, onClick }) {
    // TODO: support unknown types
    if (phase.type === PhaseType.Unknown) {
        return <UnknownPhaseLine phase={phase} onClick={onClick}/>
    }

    const [days, range] = getDaysAndRangeText(phase.since, phase.until)
    return <PhaseLine emoji={STAY_EMOJI} title={getPhaseTitle(phase)} range={range} onClick={onClick}/>
}
