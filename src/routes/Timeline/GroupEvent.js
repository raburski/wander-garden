import { useState, Fragment, useEffect } from "react"
import { useSearchParams, ScrollRestoration } from "react-router-dom"
import countryFlagEmoji from "country-flag-emoji"
import moment from "moment"
import { styled } from 'goober'
import { onlyUnique } from "array"
import { getDaysAndRangeText } from 'date'
import CountryBar from "./CountryBar"
import Page from "components/Page"
import colors from "colors"
import Panel from "components/Panel"
import { getGroupHighlights, useTimeline, titleFromLocationHighlights, highlightTitle } from 'domain/timeline/groups'

import { EventType, TransportMode, GroupType, CalendarDayType } from 'domain/timeline/types'

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

export default function GroupEvent({ event }) {
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