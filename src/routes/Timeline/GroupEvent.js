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
    color: ${props => props.theme.text};
    cursor: pointer;
    padding: 2px;
    padding-left: 4px;
    padding-right: 4px;
    border-radius: 6px;
    font-size: 14px;

    &:hover {
        background-color: ${props => props.theme.background.highlight};
    }
`

const CalendarEventLabel = styled('div')`
    display: flex;
    color: ${props => props.theme.text};
    padding: 26px;
    padding-top: 12px;
    font-size: 16px;
    font-weight: bold;
    justify-content: center;
    align-items: center;
`

const TransportLabel = styled('div')`
    display: flex;
    color: ${props => props.theme.text};
    cursor: pointer;
    padding-left: 4px;
    padding-right: 4px;
    border-radius: 6px;
    font-size: 20px;

    &:hover {
        background-color: ${props => props.theme.background.highlight};
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
            return <CalendarEventLabel> 🥳&nbsp;&nbsp;&nbsp;{moment(event.date).get('year') - 1}&nbsp;&nbsp;&nbsp;🎉 </CalendarEventLabel>
        case CalendarDayType.NewHome:
            return (
                <CalendarEventLabel>
                    🏡&nbsp;&nbsp;&nbsp;{event.to.location.city}&nbsp;&nbsp;&nbsp;{countryFlagEmoji.get(event.to.location.cc).emoji}
                </CalendarEventLabel>
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