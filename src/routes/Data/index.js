import { useState } from "react"
import { styled } from 'goober'
import { SiSwarm } from 'react-icons/si'
import { TbDownload, TbCloudUpload, TbTrash, TbRefresh, TbShare } from 'react-icons/tb'
import { FiExternalLink, FiMapPin } from 'react-icons/fi'
import moment from 'moment'
import { getDaysAndRangeText } from 'date'
import Page from 'components/Page'
import Panel from 'components/Panel'
import { LocationAccuracy, formattedLocation } from 'domain/location'
import { useCheckins, useIsAuthenticated, useShowUpdateModal } from 'domain/swarm'
import Segment from 'components/Segment'
import InfoRow from 'components/InfoRow'
import PinButton from "components/PinButton"
import Button from "components/Button"
import Separator from 'components/HalfSeparator'
import useDebouncedInput from 'hooks/useDebouncedInput'
import TextField from 'components/TextField'
import { useDownload, useCapture, useTrash, useUpload } from "./hooks"
import { TITLES } from './consts'
import SquareImage from "components/SquareImage"
import { StayLogoURL, StayType, getStayIcon, useShowCaptureStartModal, useStays } from "domain/stays"
import { downloadString } from "files"
import CustomStayModal from "domain/stays/CustomStayModal"
import { useNavigate } from "react-router"
import Footer from "components/Footer"
import toast from "react-hot-toast"
import Base64 from "Base64"

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
            {stayType !== StayType.Custom ? <Button onClick={onButtonClick} style={{alignSelf: 'center'}}>Capture your first ones!</Button> : null}
        </NoStaysContainer>
    )
}

function NoCheckinsFound({ stayType }) {
    const navigate = useNavigate()
    const isAuthenticated = useIsAuthenticated()
    const startCheckinUpdate = useShowUpdateModal()
    const goToSettings = () => navigate('/settings')
    return (
        <NoStaysContainer>
            <SquareImage size={100} src="/logo/swarm.svg"/>
            <NoStayLabel>You don't seem to have any checkins here...</NoStayLabel>
            {isAuthenticated ? <Button onClick={startCheckinUpdate} style={{alignSelf: 'center'}}>Load your first ones!</Button> : <Button onClick={goToSettings} style={{alignSelf: 'center'}}>Connect your Swarm account in settings</Button>}
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
`

function getMapsQuery(location) {
    switch (location.accuracy) {
        case LocationAccuracy.Address:
            return `${location.address},${location.city},${location.country}`
        case LocationAccuracy.City:
            return `${location.city},${location.country}`
        case LocationAccuracy.Country:
            return location.country
        case LocationAccuracy.GPS:
            return `${location.lat},${location.lng}`
        default:
            return `${location.lat},${location.lng}`
    }
}

function StayActions({ stay }) {
    const [_, range] = getDaysAndRangeText(stay.since, stay.until)
    const year = moment(stay.since).format('YYYY')
    const onExternalClick = () => window.open(stay.url)
    const onMapClick = () => window.open(`https://maps.google.com/?q=${getMapsQuery(stay.location)}`)
    const onDownloadClick = () => {
        const since = moment(stay.since).format('DD-MM-YYYY')
        downloadString(JSON.stringify(stay), 'json', `${since}, ${stay.accomodation.name}, ${stay.location.city}.json`)
    }
    const onShareClick = () => {
        const base64 = Base64.encode(JSON.stringify(stay))
        const host = window.location.host
        const protocol = window.location.protocol
        const link = `${protocol}//${host}/stays/${stay.id}?data=${base64}`
        navigator.clipboard.writeText(link)
        toast.success('Link copied to your clipboard')
    }

    return (
        <StayActionsContainer>
            {range} {year}
            <Separator />
            <PinButton icon={FiMapPin} onClick={onMapClick} tooltip="Show on map" tooltipPosition="left" tooltipOffset={93}/>
            {stay.url ? <Separator /> : null}
            {stay.url ? <PinButton icon={FiExternalLink} onClick={onExternalClick} tooltip="Open booking" tooltipPosition="left" tooltipOffset={96}/> : null}
            <Separator />
            <PinButton icon={TbDownload} onClick={onDownloadClick} tooltip="Download stay" tooltipPosition="left" tooltipOffset={100}/>
            <Separator />
            <PinButton icon={TbShare} onClick={onShareClick} tooltip="Copy stay link" tooltipPosition="left" tooltipOffset={100}/>
        </StayActionsContainer>
    )
}

function formattedMoney(money) {
    return `${money.amount} ${money.currency.toUpperCase()}`
}

function StayRow({ stay, icon, ...props }) {
    const guestsSubtitle = (stay.totalGuests && stay.totalGuests > 1) ? `for ${stay.totalGuests} people ` : ''
    const priceSubtitle = stay.price ? `for ${formattedMoney(stay.price)} ` : ''
    const locationSubtitle = stay.location ? `in ${formattedLocation(stay.location)}` : ''
    const subtitle = `${guestsSubtitle}${priceSubtitle}${locationSubtitle}`
    return <InfoRow icon={icon} title={stay.accomodation.name} subtitle={subtitle} right={<StayActions stay={stay}/>} {...props}/>
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
    return filteredCheckins.length > 0 ? filteredCheckins.map(checkin => <CheckinRow checkin={checkin} key={checkin.id} />) : <NoCheckinsFound />
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

function StaysList({ search, type, onStayClick }) {
    const stays = useStays(type)
    const filteredStays = search ? stays.filter(isStayMatchingPhrase(search)) : [...stays]
    filteredStays.sort((a, b) => moment(b.since).diff(moment(a.since)))
    return filteredStays.length > 0 ? filteredStays.map(stay => 
        <StayRow
            onClick={onStayClick ? () => onStayClick(stay) : undefined}
            icon={getStayIcon(stay, type)} 
            stay={stay}
            key={stay.id}
        />
    ) : <NoStaysFound stayType={type}/>
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
                <Button icon={TbTrash} onClick={onTrashClick} disabled={!onTrashClick} tooltip="Remove all" />
                <Separator />
                <Button icon={TbDownload} onClick={onDownloadClick} disabled={!onDownloadClick} tooltip="Download all" />
                <Separator />
                <Button icon={TbCloudUpload} onClick={onUploadClick} tooltip="Upload from file" />
                <Separator />
                <Button icon={TbRefresh} onClick={onRefreshClick} disabled={!onRefreshClick} tooltip="Capture"/>
                <Separator />
                <TextField placeholder="Search" onChange={onChangeSearch}/>
            </ActionsContainer>
        </HeaderContainer>
    )
}


export default function Data() {
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [editStayModalProps, setEditStayModalProps] = useState()
    const onDownloadClick = useDownload(selectedIndex)
    const onUploadClick = useUpload(selectedIndex)
    const onTrashClick = useTrash(selectedIndex)
    const onRefreshClick = useCapture(selectedIndex)
    const [search, onChangeSearch] = useDebouncedInput()

    const cancelEdit = () => setEditStayModalProps(undefined)
    const onCustomStayClick = (stay) => setEditStayModalProps({ stay })

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
                {selectedIndex === 0 ? <StaysList type={StayType.Booking} search={search}/> : null}
                {selectedIndex === 1 ? <StaysList type={StayType.Airbnb} search={search}/> : null}
                {selectedIndex === 2 ? <StaysList type={StayType.Agoda} search={search}/> : null}
                {selectedIndex === 3 ? <StaysList type={StayType.Travala} search={search}/> : null}
                {selectedIndex === 4 ? <StaysList type={StayType.Custom} onStayClick={onCustomStayClick} search={search}/> : null}
                {selectedIndex === 5 ? <SwarmCheckinsList search={search}/> : null}
            </Panel>
            {editStayModalProps ? <CustomStayModal onClickAway={cancelEdit} {...editStayModalProps}/> : null}
            <Footer />
        </Page>
    )
}