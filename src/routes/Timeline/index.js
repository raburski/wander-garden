import { useState, Fragment } from "react"
import { useSearchParams, Link } from "react-router-dom"
import countryFlagEmoji from "country-flag-emoji"
import moment from "moment"
import { styled } from 'goober'
import { onlyUnique } from "../../array"
import { useCheckins } from "../../domain/swarm"
import { onlyNonTransportation, venueEmoji } from '../../domain/swarm/categories'
import { getCategory } from "../../domain/swarm/categories"
import CountryBar from "./CountryBar"
import Page from "../../components/Page"
import colors from "../../colors"
import Panel from "../../components/Panel"
import { getGroupHighlights } from './timeline.groups'
import ToggleButton from "../../components/ToggleButton"

import createTimeline from './timeline'
import { EventType, TransportMode, GroupType, LocationHighlightType, CalendarDayType } from './types'
import { Segment } from "../../components/Segment"
import { createNewYearCalendarEvent } from "./timeline.events"
import { useSetting } from "../../settings"

const AllFlagsContainer = styled('div')`
    display: flex;
    flex-direction: row;
    margin-bottom: 8px;
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

const CalendarNewYearEventLabel = styled('div')`
    display: flex;
    color: inherit;
    padding: 26px;
    padding-top: 12px;
    font-size: 24px;
    font-weight: bold;
    justify-content: center;
    align-items: center;
`

const CalendarNewHomeEventContainer = styled('div')`
    display: flex;
    flex-direction: row;
    color: inherit;
    padding: 28px;
    padding-left: 0px;
    padding-top: 12px;
`

const CalendarNewHomeEventIcon = styled('div')`
    font-size: 48px;
    align-items: center;
    margin-right: 26px;
    margin-bottom: 2px;
`

const CalendarNewHomeEventLabel = styled('div')`
    display: flex;
    flex: 1;
    font-size: 22px;
    align-items: center;
`

const CalendarNewHomeEventDate = styled('div')`
    display: flex;
    font-size: 16px;
    align-items: center;
    margin-right: 26px;
    align-items: center;
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

const OptionsContainer = styled('div')`
    display: flex;
    flex-direction: row;
`

const Separator = styled('div')`
    width: 12px;
    height: 12px;
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

function highlightTitle(highlight) {
    switch (highlight.type) {
        case LocationHighlightType.City:
            return highlight.location.city
        case LocationHighlightType.State:
            return highlight.location.state
        case LocationHighlightType.Country:
            return highlight.location.country
    }
}

function CalendarEvent({ event }) {
    switch (event.dayType) {
        case CalendarDayType.NewYear:
            return <CalendarNewYearEventLabel> -&nbsp;&nbsp;&nbsp;{moment(event.date).get('year') - 1}&nbsp;&nbsp;&nbsp;- </CalendarNewYearEventLabel>
        case CalendarDayType.NewHome:
            return (
                <CalendarNewHomeEventContainer>
                    <CalendarNewHomeEventLabel>
                        <CalendarNewHomeEventIcon>🏡</CalendarNewHomeEventIcon> Moved from {countryFlagEmoji.get(event.from.location.cc).emoji} {event.from.location.city} to {countryFlagEmoji.get(event.to.location.cc).emoji} {event.to.location.city}
                    </CalendarNewHomeEventLabel>
                    <CalendarNewHomeEventDate>
                        {moment(event.date).format('DD.MM.YYYY')}
                    </CalendarNewHomeEventDate>
                </CalendarNewHomeEventContainer>
            )
    }
}

function GroupEvent({ event }) {
    switch (event.type) {
        case EventType.Checkin:
            return <PhaseLabel>{event.location.city}</PhaseLabel>
        case EventType.Transport:
            return <TransportLabel>{TransportMode_EMOJI[event.mode]}</TransportLabel>
        case EventType.Calendar:
            return <CalendarEvent event={event}/>
    }
}

const EventsContainer = styled('div')`
    display: flex;
    padding: 12px;
    flex-wrap: wrap;
    align-items: center;
    border-bottom: 1px solid ${colors.border.light};
`

function TimelineGroupHome({ group }) {
    return <EventsContainer><PhaseLabel>🏠&nbsp;&nbsp;{highlightTitle(group.highlight)}</PhaseLabel></EventsContainer>
}

function TimelineGroupTrip({ group, i }) { 
    const countryCodes = group.highlights.map(highlight => highlight.location.cc)
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

function titleFromLocationHighlights(highlights) {
    return highlights.map(highlightTitle).filter(onlyUnique).reverse().join(', ')
}

const MONTH_TO_SEASON = ['❄️', '❄️', '🌸', '🌸', '🌸', '☀️', '☀️', '☀️', '🍁', '🍁', '🍁', '❄️']
function seasonEmojiForDate(date) {
    const month = date.get('month') // index from 0
    return MONTH_TO_SEASON[month]

}

function getDaysAndRangeForGroup(group) {
    if (group.groups.length > 1) { return [] }
    // This only makes sense if single trip is in the group
    const until = moment(group.until)
    const since = moment(group.since)
    const numberOfDays = until.diff(since, 'days')
    const daysSuffix = numberOfDays === 1 ? 'day' : 'days'
    const days = `${numberOfDays} ${daysSuffix}`
    const season = seasonEmojiForDate(moment(group.since).add(numberOfDays/2, 'days'))
    const range = `${since.format('DD.MM')} - ${until.format('DD.MM')} ${season}`
    return [days, range]
}

function TimelineGroupContainer({ group, i }) {
    // TODO: add chevron and animate shit out of this
    const [expanded, setExpanded] = useState(false)
    const countryCodes = group.highlights.map(highlight => highlight.location.cc).filter(onlyUnique).reverse()
    const [days, range] = getDaysAndRangeForGroup(group)

    const title = titleFromLocationHighlights(group.highlights)
    return (
        <Fragment>
            <CountryBar
                title={title}
                subtitle={i}
                countryCodes={countryCodes}
                onClick={() => setExpanded(!expanded)}
                days={days}
                range={range}
            />
            {expanded && group.groups.map(g => <TimelineGroup group={g} />)}
        </Fragment>
    )
}

const GroupPanel = styled(Panel)`
    margin-bottom: 0px;
`

function TimelineGroup({ group, topLevel, i }) {
    const Container = topLevel ? GroupPanel : Fragment
    switch (group.type) {
        case GroupType.Home:
            return <Container><TimelineGroupHome group={group} i={i}/></Container>
        case GroupType.Trip:
            return <Container><TimelineGroupTrip group={group} i={i}/></Container>
        case GroupType.Container:
            return group.highlights.length > 0 ? <Container><TimelineGroupContainer group={group} i={i}/></Container> : null
        case GroupType.Plain:
            return group.events.map(event => <GroupEvent event={event}/>)
        case GroupType.Transport:
            return <Container><TimelineGroupTransport group={group} i={i}/></Container>
    }
}

function Timeline({ timeline }) {
    return timeline.map((group, i) => <TimelineGroup group={group} i={i} topLevel/>)
}

const TIMELINE_SEGMENT_OPTION_SETTING = 'TIMELINE_SEGMENT_OPTION'
export default function TimelinePage() {
    const [segmentOptionSetting, setSegmentOptionSetting] = useSetting(TIMELINE_SEGMENT_OPTION_SETTING)
    const [params] = useSearchParams()
    // const [viewSegmentSelected, setViewSegmentSelected] = useState(segmentOptionSetting | 0)
    const selectedCountryCode = params.get('cc')?.toLowerCase()

    const [checkins] = useCheckins()
    const countryCodes = checkins.filter(onlyNonTransportation).map(checkin => checkin?.venue?.location?.cc).filter(onlyUnique)
    const timelineConfig = { tripsOnly: segmentOptionSetting > 0, foreignOnly: segmentOptionSetting === 2 }
    const timeline = createTimeline(checkins, timelineConfig)
    const filteredTimeline = selectedCountryCode ? timeline.filter(group => {
        if (group.type === GroupType.Plain) { return true }
        const locations = getGroupHighlights(group).map(h => h.location.cc)
        return locations.some(cc => cc.toLowerCase() === selectedCountryCode)
    }) : timeline

    const viewSegmentOptions = ['all', 'trips', 'abroad']
    console.log('timeline', filteredTimeline[14])

    return (
        <Page header="Timeline">
            <Panel spacing>
                <AllFlags countryCodes={countryCodes} selectedCountryCode={selectedCountryCode}/>
                <OptionsContainer>
                    <Segment titles={viewSegmentOptions} selectedIndex={segmentOptionSetting} onClick={setSegmentOptionSetting}/>
                </OptionsContainer>
            </Panel>
            <Timeline timeline={filteredTimeline} />
        </Page>
    )
}
