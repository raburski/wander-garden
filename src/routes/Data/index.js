import { useState } from "react"
import { styled } from 'goober'
import { SiSwarm } from 'react-icons/si'
import { TbBrandBooking, TbBrandAirbnb, TbDownload, TbCloudUpload } from 'react-icons/tb'
import { FiExternalLink, FiMapPin } from 'react-icons/fi'
import { downloadString, uploadFile } from 'files'
import moment from 'moment'
import { getDaysAndRangeText } from 'date'
import Page from 'components/Page'
import Panel from '../../components/Panel'
import { formattedLocation } from 'domain/location'
import { useCheckins } from 'domain/swarm'
import { useBookingStays } from 'domain/bookingcom'
import { useAirbnbStays } from 'domain/airbnb'
import Segment from 'components/Segment'
import NoneFound from 'components/NoneFound'
import InfoRow from 'components/InfoRow'
import PinButton from "components/PinButton"
import Button from "components/Button"
import Separator from 'components/HalfSeparator'

function CheckinRow({ checkin }) {
    const subtitle = `in ${formattedLocation(checkin.venue.location)}`
    return <InfoRow icon={SiSwarm} title={checkin.venue.name} subtitle={subtitle} right={moment(checkin.date).format('DD/MM/YYYY')}/>
}

const StayActionsContainer = styled('div')`
    display: flex;
    flex-direction: row;
    align-items: center;
`

function StayActions({ stay }) {
    const [_, range] = getDaysAndRangeText(stay.since, stay.until)
    const year = moment(stay.since).format('YYYY')
    const onExternalClick = () => window.open(stay.url)
    const onMapClick = () => window.open(`https://maps.google.com/?q=${stay.location.lat},${stay.location.lng}`)

    return (
        <StayActionsContainer>
            {range} {year}
            <Separator />
            <PinButton icon={FiMapPin} onClick={onMapClick}/>
            <Separator />
            <PinButton icon={FiExternalLink} onClick={onExternalClick}/>
        </StayActionsContainer>
    )
}

function StayRow({ stay, icon }) {
    const subtitle = `in ${formattedLocation(stay.location)}`
    return <InfoRow icon={icon} title={stay.accomodation.name} subtitle={subtitle} right={<StayActions stay={stay}/>}/>
}

function SwarmCheckinsList() {
    const [checkins] = useCheckins()
    return checkins.length > 0 ? checkins.map(checkin => <CheckinRow checkin={checkin} key={checkin.id} />) : <NoneFound />
}

function BookingComList() {
    const [stays] = useBookingStays()
    return stays.length > 0 ? stays.map(stay => <StayRow icon={TbBrandBooking} stay={stay} key={stay.id} />) : <NoneFound />
}

function AirbnbList() {
    const [stays] = useAirbnbStays()
    return stays.length > 0 ? stays.map(stay => <StayRow icon={TbBrandAirbnb} stay={stay} key={stay.id} />) : <NoneFound />
}

const HeaderContainer = styled('div')`
    display: flex;
    flex-direction: row;
    align-items: center;
`

const ActionsContainer = styled('div')`
    display: flex;
    flex: 1;
    flex-direction: row-reverse;
    align-items: flex-end;
`

function Header({ selectedIndex, setSelectedIndex, onDownloadClick, onUploadClick }) {
    const titles = ['Swarm', 'Booking.com', 'Airbnb']
    return (
        <HeaderContainer>
            <Segment titles={titles} selectedIndex={selectedIndex} onClick={setSelectedIndex}/>
            <ActionsContainer>
                <Button icon={TbDownload} onClick={onDownloadClick} disabled={!onDownloadClick}/>
                <Separator />
                <Button icon={TbCloudUpload} onClick={onUploadClick}/>
            </ActionsContainer>
        </HeaderContainer>
    )
}

function useDownload(index) {
    const [swarm] = useCheckins()
    const [booking] = useBookingStays()
    const [airbnb] = useAirbnbStays()

    switch (index) {
        case 0: return swarm.length > 0 ? () => downloadString(JSON.stringify(swarm), 'json', 'swarm.json') : undefined
        case 1: return booking.length > 0 ? () => downloadString(JSON.stringify(booking), 'json', 'booking.json') : undefined
        case 2: return airbnb.length > 0 ? () => downloadString(JSON.stringify(airbnb), 'json', 'airbnb.json') : undefined
    }
}

export default function Data() {
    const [selectedIndex, setSelectedIndex] = useState(0)
    const onDownloadClick = useDownload(selectedIndex)
    
    return (
        <Page header="Data">
            <Header selectedIndex={selectedIndex} setSelectedIndex={setSelectedIndex} onDownloadClick={onDownloadClick}/>
            <Panel style={{maxHeight: '84%', marginTop: 22}} contentStyle={{ overflow: 'scroll' }}>
                {selectedIndex === 0 ? <SwarmCheckinsList /> : null}
                {selectedIndex === 1 ? <BookingComList /> : null}
                {selectedIndex === 2 ? <AirbnbList /> : null}
            </Panel>
        </Page>
    )
}