import Page from "components/Page"
import InfoPanel from "components/InfoPanel"
import SquareImage from 'components/SquareImage'
import { useExtensionStatus, Status, StayType, StayName, StayLogoURL } from 'domain/extension'
import OnlineDot from './OnlineDot'
import ExtensionVersionNotMatching from './VersionMismatch'
import ExtensionTroubleshoot from './Troubleshoot'
import ExtensionCapturingModal from './CapturingModal'
import WebStoreButton from "./WebStoreButton"
import StartCaptureModal from "./StartCaptureModal"
import Panel from "components/Panel"
import { SlPuzzle } from 'react-icons/sl'
import { styled } from "goober"
import ContentRow from "components/ContentRow"
import { useState } from "react"

const COPY = `In order to enhance your dataset you can install garden browser extension. It will help you import your booking.com, airbnb and agoda bookings.

Once installed please refresh this page.

`

function ExtensionNotConnected() {
    return (
        <InfoPanel spacing style={{alignSelf:'flex-start'}} image={<SquareImage size={200} src="/3d/puzzle.png"/>}>
            {COPY}
            <WebStoreButton />
        </InfoPanel>
    )
}

function ExtensionStatus({ isConnected }) {
    return (
        <InfoPanel header="Status" spacing image={<OnlineDot isConnected={isConnected}/>}>
            {isConnected ? 'Connected' : 'Disconnected'}
        </InfoPanel>
    )
}

const HOW_COPY = `Extension will open new browser tab. It will automatically navigate through the website and will capture all your trips.
You may also download stay files manually by visiting websites yourself.

Select one of the sources below to start the process!

IMPORTANT: You may need to log in to your account before automatic process starts.
`

const PuzzleLogo = styled(SlPuzzle)`
    font-size: 30px;
    padding: 2px;
`

function HowItWorks() {
    return <InfoPanel header="How this works?" spacing image={<SquareImage size={120} src="/3d/puzzle.png"/>}>{HOW_COPY}</InfoPanel>
}

const Logo = styled('img')`
    width: 32px;
    height: 32px;
    padding: 6px;
`

function Stays() {
    const [selectedSource, setSelectedSource] = useState()

    const createSelectStayType = (stayType) => function onStayTypeSelect() {
        setSelectedSource(stayType)
    }

    return (
        <Panel header="Stays">
            <ContentRow image={<Logo src={StayLogoURL[StayType.Booking]}/>} title={StayName[StayType.Booking]} onClick={createSelectStayType(StayType.Booking)}/>
            <ContentRow image={<Logo src={StayLogoURL[StayType.Airbnb]}/>} title={StayName[StayType.Airbnb]} onClick={createSelectStayType(StayType.Airbnb)}/>
            <ContentRow image={<Logo src={StayLogoURL[StayType.Agoda]}/>} title={StayName[StayType.Agoda]} onClick={createSelectStayType(StayType.Agoda)}/>
            <StartCaptureModal
                stayType={selectedSource}
                onCancel={() => setSelectedSource(undefined)}
            />
        </Panel>
    )
}

function ExtensionConnected({ capturing }) {
    return (
        <>
            <HowItWorks />
            <ExtensionStatus isConnected/>
            <Stays />
            <ExtensionCapturingModal isOpen={capturing}/>
        </>
    )
}

function ExtensionFailed() {
    return (
        <>
            <ExtensionStatus/>
            <ExtensionTroubleshoot />
        </>
    )
}

function ExtensionContent() {
    const extensionStatus = useExtensionStatus()
    switch (extensionStatus) {
        case Status.Unknown: return <ExtensionNotConnected />
        case Status.Connected: return <ExtensionConnected />
        case Status.Capturing: 
            return <ExtensionConnected capturing={extensionStatus === Status.Capturing} />
        case Status.Failed: return <ExtensionFailed />
        case Status.Incompatible: return <ExtensionVersionNotMatching />
    }
}

export default function Hotels() {
    return (
        <Page header="Extension">
            <ExtensionContent />
        </Page>
    )
}