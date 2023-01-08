import { useState, Fragment } from "react"
import { useSearchParams, Link } from "react-router-dom"
import countryFlagEmoji from "country-flag-emoji"
import moment from "moment"
import { styled } from 'goober'
import { onlyUnique } from "array"
import CountryBar from "./CountryBar"
import Page from "components/Page"
import colors from "colors"
import Panel from "components/Panel"
import { getGroupHighlights, useTimeline, titleFromLocationHighlights, highlightTitle } from 'domain/timeline/groups'

import { EventType, TransportMode, GroupType, CalendarDayType } from 'domain/timeline/types'
import { Segment } from "components/Segment"
import { useSetting } from "settings"
import { useTitle, useVisitedCountryCodes } from "domain/timeline"
import GroupMoreModal from "./GroupMoreModal"

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
        default:
            return null
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
        default:
            return null
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
    const leftToRightPhases = [...group.phases].reverse()
    return (
        <EventsContainer>{leftToRightPhases.map(event => <GroupEvent key={event.id} event={event}/>)}</EventsContainer>
    )
}

function TimelineGroupTransport({ group, i }) { 
    return null // TODO
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

function TimelineGroupContainer({ group, onMoreClick, i }) {
    // TODO: add chevron and animate shit out of this
    const [expanded, setExpanded] = useState(false)
    const tripGroup = extractTripGroup(group)
    const title = useTitle(tripGroup && tripGroup.id)
    const locationTitle = titleFromLocationHighlights(group.highlights)
    const countryCodes = group.highlights.map(highlight => highlight.location.cc).filter(onlyUnique).reverse()
    const [days, range] = getDaysAndRangeForGroup(group)

    return (
        <Fragment>
            <CountryBar
                title={title ? title : locationTitle}
                subtitle={title ? locationTitle : null}
                countryCodes={countryCodes}
                onClick={() => setExpanded(!expanded)}
                days={days}
                range={range}
                onMoreClick={onMoreClick}
            />
            {expanded && group.groups.map(g => <TimelineGroup key={g.id} group={g} />)}
        </Fragment>
    )
}

const GroupPanel = styled(Panel)`
    margin-bottom: 0px;
`

function TimelineGroup({ group, topLevel, onMoreClick, i }) {
    const Container = topLevel ? GroupPanel : Fragment
    switch (group.type) {
        case GroupType.Home:
            return <Container><TimelineGroupHome group={group} i={i}/></Container>
        case GroupType.Trip:
            return <Container><TimelineGroupTrip group={group} i={i}/></Container>
        case GroupType.Container:
            return group.highlights.length > 0 ? <Container><TimelineGroupContainer group={group} i={i} onMoreClick={onMoreClick}/></Container> : null
        case GroupType.Plain:
            return group.events.map(event => <GroupEvent key={event.id} event={event}/>)
        case GroupType.Transport:
            return <Container><TimelineGroupTransport group={group} i={i}/></Container>
        default:
            return null
    }
}

function extractTripGroup(group) {
    if (group.type === GroupType.Trip) {
        return group
    } else if (group.type === GroupType.Container) {
        return group.groups.find(g => g.type === GroupType.Trip)
    }
    return undefined
}

function Timeline({ timeline }) {
    const [selectedGroup, setSelectedGroup] = useState()
    return (
        <Fragment>
            {timeline.map((group, i) => <TimelineGroup key={group.id} group={group} onMoreClick={() => setSelectedGroup(extractTripGroup(group))} i={i} topLevel/>)}
            {selectedGroup ? <GroupMoreModal group={selectedGroup} onClickAway={() => setSelectedGroup(undefined)}/> : null}
        </Fragment>
    )
}

const TIMELINE_SEGMENT_OPTION_SETTING = 'TIMELINE_SEGMENT_OPTION'
export default function TimelinePage() {
    const [segmentOptionSetting, setSegmentOptionSetting] = useSetting(TIMELINE_SEGMENT_OPTION_SETTING)
    const [params] = useSearchParams()
    const selectedCountryCode = params.get('cc')?.toLowerCase()
    const [countryCodes] = useVisitedCountryCodes()

    const timelineConfig = { tripsOnly: segmentOptionSetting > 0, foreignOnly: segmentOptionSetting === 2 }
    const timeline = useTimeline(timelineConfig)
    const filteredTimeline = selectedCountryCode ? timeline.filter(group => {
        if (group.type === GroupType.Plain) { return true }
        const locations = getGroupHighlights(group).map(h => h.location.cc)
        return locations.some(cc => cc.toLowerCase() === selectedCountryCode)
    }) : timeline

    const viewSegmentOptions = ['all', 'trips', 'abroad']

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
