import { useEffect, useState } from "react"
import { styled } from "goober"
import { SiSwarm, SiNetflix } from 'react-icons/si'
import moment from 'moment'
import { TYPE, useEvents } from '../events'
import Page from '../components/Page'
import { formattedLocation } from '../location'

const EventContainer = styled('div')`
    display: flex;
    flex-direction: row;
    background-color: #fafafa;
    border: 1px solid #ebebeb;
    border-radius: 12px;
    padding: 8px;
    padding-left: 12px;
    padding-right: 12px;
    margin: 4px;
    align-items: center;
`

const Name = styled('div')`
    margin-left: 12px;
`

const Subtitle = styled('div')`
    flex: 1;
    margin-left: 12px;
    font-size: 14px;
    color: #4f4f4f;
`

const Date = styled('div')`
    margin-left: 12px;
    font-size: 12px;
    color: #4f4f4f;
`

function CheckinEvent({ checkin }) {
    return (
        <EventContainer>
            <SiSwarm />
            <Name>{checkin.venue.name}</Name>
            <Subtitle>in {formattedLocation(checkin.venue.location)}</Subtitle>
            <Date>{moment(checkin.date).format('DD/MM/YYYY')}</Date>
        </EventContainer>
    )
}

function WatchEvent({ watch }) {
    return (
        <EventContainer>
            <SiNetflix />
            <Name>{watch.title}</Name>
            <Subtitle>{[watch.season, watch.episode].filter(Boolean).join(': ')}</Subtitle>
            <Date>{moment(watch.date).format('DD/MM/YYYY')}</Date>
        </EventContainer>
    )
}

function EventBar({ event }) {
    switch (event.type) {
        case TYPE.CHECKIN: return <CheckinEvent checkin={event} />
        case TYPE.WATCH: return <WatchEvent watch={event} />
        default: return null
    }
}

export default function Event() {
    const events = useEvents()
    return (
        <Page header="Events">
            {events === null ? "Loading..." : events.map(event => <EventBar event={event} key={events.id}/>)}
        </Page>
    )
}