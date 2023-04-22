import { getDaysAndRangeText } from 'date'
import PhaseLine from './PhaseLine'
import { PhaseType } from './useTrip'
import { TbAdjustments, TbCloudUpload, TbCornerLeftUp } from 'react-icons/tb'
import Button from 'components/PillLink'

const UNKNOWN_EMOJI = '❔'

function UnknownPhaseLine({ phase }) {
    const [days, range] = getDaysAndRangeText(phase.since, phase.until)
    return (
        <PhaseLine emoji={UNKNOWN_EMOJI} title={`Where did you stay for ${days}?`} range={range}>
            <Button small icon={TbCornerLeftUp}>extend previous</Button>
            <Button small icon={TbCloudUpload}>import from file</Button>
            <Button small icon={TbAdjustments}>other options</Button>
        </PhaseLine>
    )
}

function getPhaseTitle(phase) {
    return phase?.stay?.accomodation?.name
}

const STAY_EMOJI = '🛌'

function presentHotelDetail() {}

export default function Phase({ phase, ...props }) {
    // TODO: support unknown types
    if (phase.type === PhaseType.Unknown) {
        return <UnknownPhaseLine phase={phase} />
    }

    const [days, range] = getDaysAndRangeText(phase.since, phase.until)
    return <PhaseLine emoji={STAY_EMOJI} title={getPhaseTitle(phase)} range={range} onClick={presentHotelDetail} {...props}/>
}
