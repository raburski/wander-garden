import { useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import countryFlagEmoji from "country-flag-emoji"
import { styled } from 'goober'
import { onlyUnique } from "../../array"
import { useCheckins } from "../../swarm"
import { onlyNonTransportation, venueEmoji } from '../../swarm/categories'
import { getCategory } from "../../swarm/categories"
import CountryBar from "./CountryBar"
import Page from "../../components/Page"
import colors from "../../colors"
import Panel from "../../components/Panel"

import createTimeline from './timeline'
import { GROUP_TYPE } from './timeline.groups'
import { EVENT_TYPE, TRANSPORT_MODE } from './timeline.events'

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

function TimelineGroupHome({ group }) {
    return <CountryBar name={`🏠 ${group.location.country}`} code={group.location.cc}/>
}

const TRANSPORT_MODE_EMOJI = {
    [TRANSPORT_MODE.BICYCLE]: '🚲',
    [TRANSPORT_MODE.BUS]: '🚌',
    [TRANSPORT_MODE.CAR]: '🚗',
    [TRANSPORT_MODE.FOOT]: '🚶🏼',
    [TRANSPORT_MODE.MOTOBIKE]: '🏍',
    [TRANSPORT_MODE.PLANE]: '✈️',
    [TRANSPORT_MODE.SHIP]: '🛥',
    [TRANSPORT_MODE.TRAIN]: '🚅',
    [TRANSPORT_MODE.CAMPERVAN]: '🚐',
    [TRANSPORT_MODE.UNKNOWN]: '❔',
}

function GroupEvent({ event }) {
    switch (event.type) {
        case EVENT_TYPE.CHECKIN:
            return <PhaseLabel>{event.location.city}</PhaseLabel>
        case EVENT_TYPE.TRANSPORT:
            return <TransportLabel>{TRANSPORT_MODE_EMOJI[event.mode]}</TransportLabel>
    }
}

const EventsContainer = styled('div')`
    display: flex;
    padding: 12px;
    flex-wrap: wrap;
    align-items: center;
    border-top: 1px solid ${colors.border.normal};
`

function TimelineGroupMultihop({ group, i }) { 
    const leftToRightPhases = [...group.phases].reverse()
    return (
        <CountryBar name={`${group.location.country} ${i}`} code={group.location.cc}>
            <EventsContainer>{leftToRightPhases.map(event => <GroupEvent event={event}/>)}</EventsContainer>
        </CountryBar>
    )
}

function TimelineGroupTransport({ group, i }) { 
    const firstTransport = group.phases[0]
    return (
        <CountryBar name={`Transport ${firstTransport.from.cc} to ${firstTransport.to.cc}`} code={firstTransport.from.cc}>

        </CountryBar>
    )
}

function TimelineGroup({ group, i }) {
    switch (group.type) {
        case GROUP_TYPE.HOME:
            return <TimelineGroupHome group={group} i={i}/>
        case GROUP_TYPE.MULTIHOP_TRIP:
            return <TimelineGroupMultihop group={group} i={i}/>
        // case GROUP_TYPE.TRANSPORT:
        //     return <TimelineGroupTransport group={group} i={i}/>
    }
}

function Timeline({ timeline }) {
    return timeline.map((group, i) => <TimelineGroup group={group} i={i}/>)
}

export default function TimelinePage() {
    const [params] = useSearchParams()
    const selectedCountryCode = params.get('cc')?.toLowerCase()

    const [checkins] = useCheckins()
    const countryCodes = checkins.filter(onlyNonTransportation).map(checkin => checkin?.venue?.location?.cc).filter(onlyUnique)
    const timeline = createTimeline(checkins)
    console.log('timeline', timeline[16])

    return (
        <Page header="Timeline">
            <Panel spacing>
                <AllFlags countryCodes={countryCodes} selectedCountryCode={selectedCountryCode}/>
            </Panel>
            <Timeline timeline={timeline} />
        </Page>
    )
}
