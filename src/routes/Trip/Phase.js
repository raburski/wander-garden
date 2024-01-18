import { getDaysAndRangeText } from 'date'
import PhaseLine from './PhaseLine'
import { getStayIcon } from 'domain/stays'
import { styled } from 'goober'
import { FaQuestion } from 'react-icons/fa'
import { isSignificant, venueEmoji } from 'domain/swarm/categories'
import { TripPhaseEventType } from 'domain/trips/types'
import { TourLogoURL } from 'domain/tours/types'
import createEmojiIcon from 'components/createEmojiIcon'
import { useEditSubjectNote, useSubjectNote } from 'domain/notes'
import FlightsPhaseLine from './FlightsPhaseLine'

const QuestionMark = styled(FaQuestion)`
    color: red;
`

function UnknownPhaseLine({ phase, ...props }) {
    const [days, range] = getDaysAndRangeText(phase.since, phase.until)
    return (
        <PhaseLine icon={QuestionMark} style={{marginTop: 10, marginBottom: 10}} title={`Where did you stay for ${days}?`} {...props} />
    )
}

const CheckinPhaseLine = styled(PhaseLine)`
    margin-left: 24px;
`


function CheckinEventLine({ checkin, note, ...props }) {
    const emoji = venueEmoji(checkin.venue)
    const Icon = createEmojiIcon(emoji)
    return <CheckinPhaseLine icon={Icon} note={note?.highlight} title={checkin.venue.name} {...props}/>
}

const IconImage = styled('img')`
    width: 18px;
    height: 18px;
    object-fit: contain;
`

const TourPhaseLine = styled(PhaseLine)`
    background-color: ${props => props.theme.primary.highlight};
    border-radius: 8px;
    margin-left: 12px;
    margin-right: 12px;
    padding-left: 22px;
    padding-right: 6px;
`

function TourEventLine({ tour, note, ...props }) {
    const logoURL = TourLogoURL[tour.tourType]
    const LogoIcon = () => <IconImage src={logoURL} />
    return <TourPhaseLine icon={LogoIcon} note={note?.highlight} title={tour.title} {...props}/>
}

function EventLine({ event, ...props }) {
    const note = useSubjectNote(getEventSubjectId(event))
    switch (event.type) {
        case TripPhaseEventType.Checkin:
            return <CheckinEventLine checkin={event.checkin} note={note} {...props}/>
        case TripPhaseEventType.Tour:
            return <TourEventLine tour={event.tour} note={note} {...props}/>
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

function getEventSubjectId(event) {
    switch (event.type) {
        case TripPhaseEventType.Checkin:
            return event.checkin.id
        case TripPhaseEventType.Tour:
            return event.tour.id
        default:
            return undefined
    }
}

export default function Phase({ phase, onClick, onMouseEnter, ...props }) {
    const editNote = useEditSubjectNote()
    const note = useSubjectNote(phase?.stay?.id)
    const events = phase?.events || []
    const significantEvents = events.filter(isEventSignificant)
    
    if (!phase.stay) {
        return (
            <>
                {phase.arriveBy && phase.arriveBy.length > 0 ? <FlightsPhaseLine flights={phase.arriveBy}/> : null}
                <UnknownPhaseLine phase={phase} onClick={onClick}/>
                {significantEvents.map(event => <EventLine event={event} onNoteClick={() => editNote(getEventSubjectId(event))}/>)}
            </>
        )
    }

    const [days, range] = getDaysAndRangeText(phase.stay.since, phase.stay.until)
    return (
        <>
            {phase.arriveBy && phase.arriveBy.length > 0 ? <FlightsPhaseLine flights={phase.arriveBy}/> : null}
            <PhaseLine icon={getStayIcon(phase.stay, phase.stay.type)} onNoteClick={() => editNote(phase.stay.id)} title={getPhaseTitle(phase)} days={days} range={range} note={note?.highlight} onClick={onClick} onMouseEnter={onMouseEnter}/>
            {significantEvents.map(event => <EventLine event={event} onNoteClick={() => editNote(getEventSubjectId(event))}/>)}
        </>
    )
}
