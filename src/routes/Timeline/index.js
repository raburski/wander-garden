import { useState, Fragment } from "react"
import { useSearchParams, Link } from "react-router-dom"
import countryFlagEmoji from "country-flag-emoji"
import moment from "moment"
import { styled } from 'goober'
import { onlyUnique } from "../../array"
import { useCheckins } from "../../swarm"
import { onlyNonTransportation, venueEmoji } from '../../swarm/categories'
import { getCategory } from "../../swarm/categories"
import CountryBar from "./CountryBar"
import Page from "../../components/Page"
import colors from "../../colors"
import Panel from "../../components/Panel"
import { getGroupLocations } from './timeline.groups'

import createTimeline from './timeline'
import { EventType, TransportMode, GroupType } from './types'

const AllFlagsContainer = styled('div')`
    display: flex;
    flex-direction: row;
`

const StyledFlagButton = styled(Link)`
    display: flex;
    color: inherit;
    text-decoration: none;
    cursor: pointer;
    padding-left: 4px;
    padding-right: 4px;
    border-radius: 6px;
    font-size: 28px;

    &:hover {
        background-color: ${colors.neutral.highlight};
    }
`

const PhaseLabel = styled('div')`
    display: flex;
    color: inherit;
    cursor: pointer;
    padding: 2px;
    padding-left: 4px;
    padding-right: 4px;
    border-radius: 6px;
    font-size: 14px;

    &:hover {
        background-color: ${colors.neutral.highlight};
    }
`

const TransportLabel = styled('div')`
    display: flex;
    color: inherit;
    cursor: pointer;
    padding-left: 4px;
    padding-right: 4px;
    border-radius: 6px;
    font-size: 20px;

    &:hover {
        background-color: ${colors.neutral.highlight};
    }
`


function FlagButton({ selected, style, ...props }) {
    return <StyledFlagButton style={selected ? {backgroundColor: colors.neutral.dark} : {}} {...props}/>
}

function AllFlags({ countryCodes = [], selectedCountryCode }) {
    return <AllFlagsContainer>{countryCodes.map(cc => <FlagButton key={cc} to={selectedCountryCode === cc.toLowerCase() ? `?` : `?cc=${cc.toLowerCase()}`} selected={selectedCountryCode == cc.toLowerCase()}>{countryFlagEmoji.get(cc).emoji}</FlagButton>)}</AllFlagsContainer>
}

const TransportMode_EMOJI = {
    [TransportMode.Bicycle]: '🚲',
    [TransportMode.Bus]: '🚌',
    [TransportMode.Car]: '🚗',
    [TransportMode.Foot]: '🚶🏼',
    [TransportMode.Motobike]: '🏍',
    [TransportMode.Plane]: '✈️',
    [TransportMode.Ship]: '🛥',
    [TransportMode.Train]: '🚅',
    [TransportMode.Campervan]: '🚐',
    [TransportMode.Unknown]: '❔',
}

function GroupEvent({ event }) {
    switch (event.type) {
        case EventType.Checkin:
            return <PhaseLabel>{event.location.city}</PhaseLabel>
        case EventType.Transport:
            return <TransportLabel>{TransportMode_EMOJI[event.mode]}</TransportLabel>
    }
}

const EventsContainer = styled('div')`
    display: flex;
    padding: 12px;
    flex-wrap: wrap;
    align-items: center;
    border-bottom: 1px solid ${colors.border.normal};
`

function TimelineGroupHome({ group }) {
    const location = group.location
    return <EventsContainer>🏠 {location.city}</EventsContainer>
}

function TimelineGroupTrip({ group, i }) { 
    const countryCodes = group.locations.map(location => location.cc)
    const leftToRightPhases = [...group.phases].reverse()
    return (
        <EventsContainer>{leftToRightPhases.map(event => <GroupEvent event={event}/>)}</EventsContainer>
    )
}

function TimelineGroupTransport({ group, i }) { 
    const firstTransport = group.phases[0]
    return null // TODO
    return (
        <CountryBar name={`Transport ${firstTransport.from.cc} to ${firstTransport.to.cc}`} code={firstTransport.from.cc}>

        </CountryBar>
    )
}

function TimelineGroupContainer({ group }) {
    // TODO: add chevron and animate shit out of this
    const [expanded, setExpanded] = useState(true)
    const countryCodes = group.locations.map(location => location.cc).filter(onlyUnique)
    const until = moment(group.until)
    const since = moment(group.since)
    const numberOfDays = until.diff(since, 'days')
    const daysSuffix = numberOfDays === 1 ? 'day' : 'days'
    const days = `${numberOfDays} ${daysSuffix}`
    const range = `${since.format('DD.MM')} - ${until.format('DD.MM')}`
    return (
        <Fragment>
            <CountryBar countryCodes={countryCodes} onClick={() => setExpanded(!expanded)} days={days} range={range}/>
            {expanded && group.groups.map(g => <TimelineGroup group={g} />)}
        </Fragment>
    )
}

function TimelineGroup({ group, topLevel, i }) {
    const Container = topLevel ? Panel : Fragment
    switch (group.type) {
        case GroupType.Home:
            return <Container><TimelineGroupHome group={group} i={i}/></Container>
        case GroupType.Trip:
            return <Container><TimelineGroupTrip group={group} i={i}/></Container>
        case GroupType.Container:
            return <Container><TimelineGroupContainer group={group}/></Container>
        case GroupType.Transport:
            return <Container><TimelineGroupTransport group={group} i={i}/></Container>
    }
}

function Timeline({ timeline }) {
    return timeline.map((group, i) => <TimelineGroup group={group} i={i} topLevel/>)
}

export default function TimelinePage() {
    const [params] = useSearchParams()
    const selectedCountryCode = params.get('cc')?.toLowerCase()

    const [checkins] = useCheckins()
    const countryCodes = checkins.filter(onlyNonTransportation).map(checkin => checkin?.venue?.location?.cc).filter(onlyUnique)
    const timeline = createTimeline(checkins)
    const filteredTimeline = selectedCountryCode ? timeline.filter(group => {
        const locations = getGroupLocations(group).map(l => l.cc)
        return locations.some(cc => cc.toLowerCase() === selectedCountryCode)
    }) : timeline

    return (
        <Page header="Timeline">
            <Panel spacing>
                <AllFlags countryCodes={countryCodes} selectedCountryCode={selectedCountryCode}/>
            </Panel>
            <Timeline timeline={filteredTimeline} />
        </Page>
    )
}
