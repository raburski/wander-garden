import { useState } from "react"
import { styled } from 'goober'
import { SiSwarm } from 'react-icons/si'
import { TbBrandBooking, TbBrandAirbnb, TbDownload, TbCloudUpload, TbTrash, TbRefresh } from 'react-icons/tb'
import { FiExternalLink, FiMapPin } from 'react-icons/fi'
import { MdHotel } from 'react-icons/md'
import moment from 'moment'
import { getDaysAndRangeText } from 'date'
import Page from 'components/Page'
import Panel from '../../components/Panel'
import { formattedLocation } from 'domain/location'
import { useCheckins } from 'domain/swarm'
import { useBookingStays } from 'domain/bookingcom'
import { useAirbnbStays } from 'domain/airbnb'
import { useAgodaStays } from "domain/agoda"
import Segment from 'components/Segment'
import NoneFound from 'components/NoneFound'
import InfoRow from 'components/InfoRow'
import PinButton from "components/PinButton"
import Button from "components/Button"
import Separator from 'components/HalfSeparator'
import useDebouncedInput from 'hooks/useDebouncedInput'
import TextField from 'components/TextField'
import { useDownload, useRefresh, useTrash, useUpload } from "./hooks"
import { TITLES } from './consts'
import SquareImage from "components/SquareImage"
import { StayLogoURL, StayType, useShowCaptureStartModal } from "domain/extension"
import { downloadString } from "files"

const NoStaysContainer = styled('div')`
    display: flex;
    flex: 1;
    align-self: stretch;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 38px;
`

const NoStayLabel = styled('div')`
    margin: 26px;
`

function NoStaysFound({ stayType }) {
    const startStayCapture = useShowCaptureStartModal()
    const onButtonClick = () => startStayCapture(stayType)
    return (
        <NoStaysContainer>
            <SquareImage size={100} src={StayLogoURL[stayType]}/>
            <NoStayLabel>You don't seem to have any stays here...</NoStayLabel>
            <Button onClick={onButtonClick} style={{alignSelf: 'center'}}>Capture your first ones!</Button>
        </NoStaysContainer>
    )
}

function CheckinRow({ checkin }) {
    const subtitle = `in ${formattedLocation(checkin.venue.location)}`
    return <InfoRow icon={SiSwarm} title={checkin.venue.name} subtitle={subtitle} right={moment.unix(checkin.createdAt).format('DD/MM/YYYY')}/>
}

const StayActionsContainer = styled('div')`
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 4px;
`

function StayActions({ stay }) {
    const [_, range] = getDaysAndRangeText(stay.since, stay.until)
    const year = moment(stay.since).format('YYYY')
    const onExternalClick = () => window.open(stay.url)
    const onMapClick = () => window.open(`https://maps.google.com/?q=${stay.location.lat},${stay.location.lng}`)
    const onDownloadClick = () => {
        const since = moment(stay.since).format('DD-MM-YYYY')
        downloadString(JSON.stringify(stay), 'json', `${since}, ${stay.accomodation.name}, ${stay.location.city}.json`)
    }

    return (
        <StayActionsContainer>
            {range} {year}
            <Separator />
            <PinButton icon={FiMapPin} onClick={onMapClick}/>
            <Separator />
            <PinButton icon={FiExternalLink} onClick={onExternalClick}/>
            <Separator />
            <PinButton icon={TbDownload} onClick={onDownloadClick}/>
        </StayActionsContainer>
    )
}

function formattedMoney(money) {
    return `${money.amount} ${money.currency.toUpperCase()}`
}

function StayRow({ stay, icon }) {
    const subtitle = `${stay.price ? `for ${formattedMoney(stay.price)}` : ''} in ${formattedLocation(stay.location)}`
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
    const filteredStays = search ? stays.filter(isStayMatchingPhrase(search)) : [...stays]
    filteredStays.sort((a, b) => moment(b.since).diff(moment(a.since)))
    return filteredStays.length > 0 ? filteredStays.map(stay => <StayRow icon={TbBrandBooking} stay={stay} key={stay.id} />) : <NoStaysFound stayType={StayType.Booking}/>
}

function AirbnbList({ search }) {
    const [stays] = useAirbnbStays()
    const filteredStays = search ? stays.filter(isStayMatchingPhrase(search)) : [...stays]
    filteredStays.sort((a, b) => moment(b.since).diff(moment(a.since)))
    return filteredStays.length > 0 ? filteredStays.map(stay => <StayRow icon={TbBrandAirbnb} stay={stay} key={stay.id} />) : <NoStaysFound stayType={StayType.Airbnb}/>
}

function AgodaList({ search }) {
    const [stays] = useAgodaStays()
    const filteredStays = search ? stays.filter(isStayMatchingPhrase(search)) : [...stays]
    filteredStays.sort((a, b) => moment(b.since).diff(moment(a.since)))
    return filteredStays.length > 0 ? filteredStays.map(stay => <StayRow icon={MdHotel} stay={stay} key={stay.id} />) : <NoStaysFound stayType={StayType.Agoda}/>
}

const HeaderContainer = styled('div')`
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
`

const ActionsContainer = styled('div')`
    display: flex;
    flex: 1;
    flex-direction: row-reverse;
    align-items: flex-end;
    margin-bottom: 22px;
`

function Header({ selectedIndex, setSelectedIndex, onRefreshClick, onDownloadClick, onUploadClick, onTrashClick, onChangeSearch }) {
    return (
        <HeaderContainer>
            <Segment titles={TITLES} selectedIndex={selectedIndex} onClick={setSelectedIndex} style={{marginBottom: 22}}/>
            <Separator />
            <ActionsContainer>
                <Button icon={TbTrash} onClick={onTrashClick} disabled={!onTrashClick}/>
                <Separator />
                <Button icon={TbDownload} onClick={onDownloadClick} disabled={!onDownloadClick}/>
                <Separator />
                <Button icon={TbCloudUpload} onClick={onUploadClick}/>
                <Separator />
                <Button icon={TbRefresh} onClick={onRefreshClick}/>
                <Separator />
                <TextField placeholder="Search" onChange={onChangeSearch}/>
            </ActionsContainer>
        </HeaderContainer>
    )
}


export default function Data() {
    const [selectedIndex, setSelectedIndex] = useState(0)
    const onDownloadClick = useDownload(selectedIndex)
    const onUploadClick = useUpload(selectedIndex)
    const onTrashClick = useTrash(selectedIndex)
    const onRefreshClick = useRefresh(selectedIndex)
    const [search, onChangeSearch] = useDebouncedInput()

    return (
        <Page header="Data">
            <Header 
                selectedIndex={selectedIndex}
                setSelectedIndex={setSelectedIndex}
                onRefreshClick={onRefreshClick}
                onDownloadClick={onDownloadClick}
                onUploadClick={onUploadClick}
                onTrashClick={onDownloadClick ? onTrashClick : undefined}
                onChangeSearch={onChangeSearch}/>
            <Panel contentStyle={{ overflow: 'scroll' }}>
                {selectedIndex === 0 ? <BookingComList search={search}/> : null}
                {selectedIndex === 1 ? <AirbnbList search={search}/> : null}
                {selectedIndex === 2 ? <AgodaList search={search}/> : null}
                {selectedIndex === 3 ? <SwarmCheckinsList search={search}/> : null}
            </Panel>
        </Page>
    )
}