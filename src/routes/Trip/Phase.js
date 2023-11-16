import { getDaysAndRangeText } from 'date'
import PhaseLine from './PhaseLine'
import { getStayIcon } from 'domain/stays'
import { styled } from 'goober'
import { FaQuestion } from 'react-icons/fa'

const QuestionMark = styled(FaQuestion)`
    color: red;
`

function UnknownPhaseLine({ phase, ...props }) {
    const [days, range] = getDaysAndRangeText(phase.since, phase.until)
    return (
        <PhaseLine icon={QuestionMark} style={{marginTop: 10, marginBottom: 10}} title={`Where did you stay for ${days}?`} range={range} {...props} />
    )
}

function getPhaseTitle(phase) {
    return phase?.stay?.accomodation?.name
}

export default function Phase({ phase, onClick, onMouseEnter, ...props }) {
    if (!phase.stay) {
        return <UnknownPhaseLine phase={phase} onClick={onClick}/>
    }

    const [days, range] = getDaysAndRangeText(phase.stay.since, phase.stay.until)
    return <PhaseLine icon={getStayIcon(phase.stay, phase.stay.type)} title={getPhaseTitle(phase)} range={range} onClick={onClick} onMouseEnter={onMouseEnter}/>
}
