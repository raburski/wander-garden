import Page from "components/Page"
import InfoPanel from "components/InfoPanel"
import SquareImage from 'components/SquareImage'
import { useExtensionStatus, STATUS } from 'domain/extension'
import OnlineDot from './OnlineDot'
import Booking from './Booking'
import Airbnb from './Airbnb'
import ExtensionVersionNotMatching from './VersionMismatch'
import ExtensionTroubleshoot from './Troubleshoot'
import ExtensionCapturing from './Capturing'
import WebStoreButton from "./WebStoreButton"
import Agoda from "./Agoda"
import ImportModal from "./ImportModal"

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

function ExtensionConnected() {
    return (
        <>
            <ExtensionStatus isConnected/>
            <Booking />
            <Airbnb />
            <Agoda />
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
        case STATUS.UNKNOWN: return <ExtensionNotConnected />
        case STATUS.CONNECTED: return <ExtensionConnected />
        case STATUS.CAPTURING: return <ExtensionCapturing />
        case STATUS.FAILED: return <ExtensionFailed />
        case STATUS.INCOMPATIBLE: return <ExtensionVersionNotMatching />
    }
}

export default function Extension() {
    return (
        <Page header="Browser extension">
            <ExtensionContent />
            <ImportModal />
        </Page>
    )
}