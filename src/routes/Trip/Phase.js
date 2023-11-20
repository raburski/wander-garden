import { getDaysAndRangeText } from 'date'
import PhaseLine from './PhaseLine'
import { getStayIcon } from 'domain/stays'
import { styled } from 'goober'
import { FaQuestion } from 'react-icons/fa'
import { isSignificant, venueEmoji } from 'domain/swarm/categories'
import { TripPhaseEventType } from 'domain/trips/types'
import { TourLogoURL } from 'domain/tours/types'
import SquareImage from 'components/SquareImage'

const QuestionMark = styled(FaQuestion)`
    color: red;
`

function UnknownPhaseLine({ phase, ...props }) {
    const [days, range] = getDaysAndRangeText(phase.since, phase.until)
    return (
        <PhaseLine icon={QuestionMark} style={{marginTop: 10, marginBottom: 10}} title={`Where did you stay for ${days}?`} range={range} {...props} />
    )
}

function emojiIcon(emoji) {
    return function EmojiIcon() { return <div>{emoji}</div> }
}

function CheckinEventLine({ checkin }) {
    const emoji = venueEmoji(checkin.venue)
    return <PhaseLine icon={emojiIcon(emoji)} title={checkin.venue.name}/>
}

const IconImage = styled('img')`
    width: 18px;
    height: 18px;
    object-fit: contain;
`

function TourEventLine({ tour }) {
    const logoURL = TourLogoURL[tour.tourType]
    const LogoIcon = () => <IconImage src={logoURL} />
    return <PhaseLine icon={LogoIcon} title={tour.title}/>
}

function EventLine({ event }) {
    switch (event.type) {
        case TripPhaseEventType.Checkin:
            return <CheckinEventLine checkin={event.checkin}/>
        case TripPhaseEventType.Tour:
            return <TourEventLine tour={event.tour} />
        default:
            return null
    }
}

function getPhaseTitle(phase) {
    return phase?.stay?.accomodation?.name
}

function isEventSignificant(event) {
    switch (event.type) {
        case TripPhaseEventType.Checkin:
            return isSignificant(event.checkin)
        case TripPhaseEventType.Tour:
            return true
        default:
            return false
    }
}

export default function Phase({ phase, onClick, onMouseEnter, ...props }) {
    const events = phase?.events || []
    if (!phase.stay) {
        return (
            <>
                <UnknownPhaseLine phase={phase} onClick={onClick}/>
                {events.map(event => <EventLine event={event} />)}
            </>
        )
    }

    const [days, range] = getDaysAndRangeText(phase.stay.since, phase.stay.until)
    return (
        <>
            <PhaseLine icon={getStayIcon(phase.stay, phase.stay.type)} title={getPhaseTitle(phase)} range={range} onClick={onClick} onMouseEnter={onMouseEnter}/>
            {events.filter(isEventSignificant).map(event => <EventLine event={event} />)}
        </>
    )
}
