import { useState, Fragment, useEffect } from "react"
import { useSearchParams, ScrollRestoration } from "react-router-dom"
import { styled } from 'goober'
import { onlyUnique } from "array"
import { getDaysAndRangeText } from 'date'
import CountryBar from "./CountryBar"
import Page from "components/Page"
import colors from "colors"
import Panel from "components/Panel"
import { getGroupHighlights, useTimeline, titleFromLocationHighlights, highlightTitle } from 'domain/timeline/groups'

import { EventType, TransportMode, GroupType, CalendarDayType } from 'domain/timeline/types'
import { useSetting } from "settings"
import { useTitle, useVisitedCountryCodes } from "domain/timeline"

import NoTimelineContent from './NoTimelineContent'
import FiltersPanel from './FiltersPanel'
import usePersistedScroll from "hooks/usePersistedScroll"

import GroupEvent from "./GroupEvent"


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
    const title = useTitle(group && group.id)
    const locationTitle = titleFromLocationHighlights(group.highlights)
    const countryCodes = group.highlights.map(highlight => highlight.location.cc).filter(onlyUnique).reverse()
    const [days, range] = getDaysAndRangeText(group.since, group.until)

    return (
        <CountryBar to={`/timeline/${group.id}`}
            title={title ? title : locationTitle}
            subtitle={title ? locationTitle : null}
            countryCodes={countryCodes}
            days={days}
            range={range}
        />
    )
}

const GroupPanel = styled(Panel)`
    margin-bottom: 0px;
`

function TimelineGroup({ group, topLevel, onMoreClick, i }) {
    const Container = topLevel ? GroupPanel : Fragment
    switch (group.type) {
        case GroupType.Container:
            return <GroupPanel>{group.groups.map(g => <TimelineGroup group={g} i={i}/>)}</GroupPanel>
        case GroupType.Home:
            return <Container><TimelineGroupHome group={group} i={i}/></Container>
        case GroupType.Trip:
            return <Container><TimelineGroupTrip group={group} i={i}/></Container>
        case GroupType.Plain:
            return group.events.map(event => <GroupEvent key={event.id} event={event}/>)
        default:
            return null
    }
}

function Timeline({ timeline }) {
    return (
        <Fragment>
            {timeline.map((group, i) => <TimelineGroup key={group.id} group={group} i={i} topLevel/>)}
        </Fragment>
    )
}

const TIMELINE_SEGMENT_OPTION_SETTING = 'TIMELINE_SEGMENT_OPTION'
const PERSIST_SCROLL_KEY = 'timeline'
function TimelineContent({ countryCodes }) {
    usePersistedScroll(PERSIST_SCROLL_KEY)
    const [segmentOptionSetting, setSegmentOptionSetting] = useSetting(TIMELINE_SEGMENT_OPTION_SETTING, 1)
    const [params] = useSearchParams()
    const selectedCountryCode = params.get('cc')?.toLowerCase()

    const timelineConfig = {
        tripsOnly: segmentOptionSetting > 0,
        foreignOnly: segmentOptionSetting === 2,
        countryCodes: selectedCountryCode ? [selectedCountryCode] : undefined,
    }
    const timeline = useTimeline(timelineConfig)

    return (
        <>
            <FiltersPanel
                countryCodes={countryCodes}
                selectedCountryCode={selectedCountryCode}
                selectedSegmentIndex={segmentOptionSetting}
                onSetSegmentIndex={setSegmentOptionSetting}
            />
            <Timeline timeline={timeline} />
        </>
    )
}

export default function TimelinePage() {
    const [countryCodes] = useVisitedCountryCodes()

    return (
        <Page header="Timeline">
            {countryCodes.length === 0 ? <NoTimelineContent /> : <TimelineContent countryCodes={countryCodes}/>}
        </Page>
    )
}
