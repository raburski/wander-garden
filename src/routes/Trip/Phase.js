import { getDaysAndRangeText } from 'date'
import PhaseLine from './PhaseLine'
import { getStayIcon } from 'domain/stays'
import { styled } from 'goober'
import { FaQuestion } from 'react-icons/fa'
import { isSignificant, venueEmoji } from 'domain/swarm/categories'

const QuestionMark = styled(FaQuestion)`
    color: red;
`

function UnknownPhaseLine({ phase, checkins, ...props }) {
    const [days, range] = getDaysAndRangeText(phase.since, phase.until)
    return (
        <PhaseLine icon={QuestionMark} style={{marginTop: 10, marginBottom: 10}} title={`Where did you stay for ${days}?`} range={range} {...props} />
    )
}

function CheckinLine({ checkin }) {
    const emoji = venueEmoji(checkin.venue)
    return <PhaseLine title={`    ${emoji}  ${checkin.venue.name}`}/>
}

function getPhaseTitle(phase) {
    return phase?.stay?.accomodation?.name
}

export default function Phase({ phase, onClick, onMouseEnter, ...props }) {
    const checkins = phase.checkins.filter(isSignificant) || []
    if (!phase.stay) {
        return (
            <>
                <UnknownPhaseLine phase={phase} checkins={checkins} onClick={onClick}/>
                {checkins.map(checkin => <CheckinLine checkin={checkin} />)}
            </>
        )
    }

    const [days, range] = getDaysAndRangeText(phase.stay.since, phase.stay.until)
    return (
        <>
            <PhaseLine checkins={checkins} icon={getStayIcon(phase.stay, phase.stay.type)} title={getPhaseTitle(phase)} range={range} onClick={onClick} onMouseEnter={onMouseEnter}/>
            {checkins.map(checkin => <CheckinLine checkin={checkin} />)}
        </>
    )
}
