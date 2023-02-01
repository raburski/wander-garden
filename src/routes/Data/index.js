import { useState } from "react"
import { styled } from 'goober'
import { SiSwarm } from 'react-icons/si'
import { TbBrandBooking, TbBrandAirbnb, TbDownload, TbCloudUpload, TbTrash } from 'react-icons/tb'
import { FiExternalLink, FiMapPin } from 'react-icons/fi'
import { downloadString, uploadFile } from 'files'
import moment from 'moment'
import { getDaysAndRangeText } from 'date'
import Page from 'components/Page'
import Panel from '../../components/Panel'
import { formattedLocation } from 'domain/location'
import { useCheckins, useClearData as useClearSwarmData } from 'domain/swarm'
import { useBookingStays, useClearData as useClearBookingData } from 'domain/bookingcom'
import { useAirbnbStays, useClearData as useClearAirbnbData } from 'domain/airbnb'
import Segment from 'components/Segment'
import NoneFound from 'components/NoneFound'
import InfoRow from 'components/InfoRow'
import PinButton from "components/PinButton"
import Button from "components/Button"
import Separator from 'components/HalfSeparator'
import useDebouncedInput from 'hooks/useDebouncedInput'
import TextField from 'components/TextField'

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

function isCheckingMatchingPhrase(phrase) {
    return checkin => {
        const candidates = [
            checkin.venue.name,
            checkin.venue.location.address,
            checkin.venue.location.city,
            checkin.venue.location.country
        ]
        return candidates.filter(Boolean).map(c => c.toLowerCase()).find(c => c.includes(phrase.toLowerCase()))
    }
}

function SwarmCheckinsList({ search }) {
    const [checkins] = useCheckins()
    const filteredCheckins = search ? checkins.filter(isCheckingMatchingPhrase(search)) : checkins
    return filteredCheckins.length > 0 ? filteredCheckins.map(checkin => <CheckinRow checkin={checkin} key={checkin.id} />) : <NoneFound />
}

function isStayMatchingPhrase(phrase) {
    return stay => {
        const candidates = [
            stay?.accomodation.name,
            stay.location.address,
            stay.location.city,
            stay.location.country
        ]
        return candidates.filter(Boolean).map(c => c.toLowerCase()).find(c => c.includes(phrase.toLowerCase()))
    }
}

function BookingComList({ search }) {
    const [stays] = useBookingStays()
    const filteredStays = search ? stays.filter(isStayMatchingPhrase(search)) : stays
    return filteredStays.length > 0 ? filteredStays.map(stay => <StayRow icon={TbBrandBooking} stay={stay} key={stay.id} />) : <NoneFound />
}

function AirbnbList({ search }) {
    const [stays] = useAirbnbStays()
    const filteredStays = search ? stays.filter(isStayMatchingPhrase(search)) : stays
    return filteredStays.length > 0 ? filteredStays.map(stay => <StayRow icon={TbBrandAirbnb} stay={stay} key={stay.id} />) : <NoneFound />
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

const TITLES = ['Swarm', 'Booking.com', 'Airbnb']
function Header({ selectedIndex, setSelectedIndex, onDownloadClick, onUploadClick, onTrashClick, onChangeSearch }) {
    return (
        <HeaderContainer>
            <Segment titles={TITLES} selectedIndex={selectedIndex} onClick={setSelectedIndex}/>
            <ActionsContainer>
                <Button icon={TbTrash} onClick={onTrashClick} disabled={!onTrashClick}/>
                <Separator />
                <Button icon={TbDownload} onClick={onDownloadClick} disabled={!onDownloadClick}/>
                <Separator />
                <Button icon={TbCloudUpload} onClick={onUploadClick} disabled/>
                <Separator />
                <TextField placeholder="Search" onChange={onChangeSearch}/>
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

function useTrash(index) {
    const clearSwarmData = useClearSwarmData()
    const clearBookingData = useClearBookingData()
    const clearAirbnbData = useClearAirbnbData()

    return () => {
        if (window.confirm(`Are you sure you want to delete all ${TITLES[index]} data?`) && window.confirm(`Are you REALLY sure you want to CLEAN IT?`)) {
            switch (index) {
                case 0: clearSwarmData(); break
                case 1: clearBookingData(); break
                case 2: clearAirbnbData(); break
                default: break
            }
        }
    }
}

export default function Data() {
    const [selectedIndex, setSelectedIndex] = useState(0)
    const onDownloadClick = useDownload(selectedIndex)
    const onTrashClick = useTrash(selectedIndex)
    const [search, onChangeSearch] = useDebouncedInput()
    
    return (
        <Page header="Data">
            <Header 
                selectedIndex={selectedIndex}
                setSelectedIndex={setSelectedIndex}
                onDownloadClick={onDownloadClick}
                onTrashClick={onDownloadClick ? onTrashClick : undefined}
                onChangeSearch={onChangeSearch}/>
            <Panel style={{maxHeight: '84%', marginTop: 22}} contentStyle={{ overflow: 'scroll' }}>
                {selectedIndex === 0 ? <SwarmCheckinsList search={search}/> : null}
                {selectedIndex === 1 ? <BookingComList search={search}/> : null}
                {selectedIndex === 2 ? <AirbnbList search={search}/> : null}
            </Panel>
        </Page>
    )
}