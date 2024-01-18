import { styled } from "goober"
import PhaseLine from "./PhaseLine"
import createEmojiIcon from "components/createEmojiIcon"
import moment from "moment"
import getAirport from "domain/flights/airports"
import { formatInLocalTimezone, getOffsetMinutes, tzlookup } from "domain/timezone"

const StyledPhaseLine = styled(PhaseLine)`
    background-color: #e6f3f5;
    border-width: 0px;

    padding-left: 12px;
    padding-right: 6px;
`

function getAirportSegment(code) {
    const airport = getAirport(code)
    return `${airport.city} (${code})`
}

function getSubtitle(flights) {
    const departure = formatInLocalTimezone(flights.first().departure.scheduled, 'HH:mm, DD MMM')
    const arrival = formatInLocalTimezone(flights.last().arrival.scheduled, 'HH:mm, DD MMM')
    return `${departure} - ${arrival}`
}

const flightIcon = createEmojiIcon("🛩️")
export default function FlightsPhaseLine({ flights }) {
    const title = [...flights.map(f => getAirportSegment(f.departure.airport)), getAirportSegment(flights.last().arrival.airport)].join(' ➡️ ')
    const subtitle = getSubtitle(flights)
    return (
        <StyledPhaseLine
            icon={flightIcon}
            title={title}
            subtitle={subtitle}
        />
    )
}