import Page from "components/Page"
import InfoPanel from "components/InfoPanel"
import SquareImage from 'components/SquareImage'
import { useExtensionStatus, Status } from 'domain/stays'
import OnlineDot from './OnlineDot'
import ExtensionVersionNotMatching from './VersionMismatch'
import ExtensionTroubleshoot from './Troubleshoot'
import WebStoreButton from "./WebStoreButton"
import Stays from './Stays'
import { isDEV } from "environment"
import Tours from "./Tours"
import Footer from "components/Footer"

const COPY = `In order to enhance your dataset you can install garden browser extension. It will help you import your booking.com, airbnb and agoda bookings.

`

function ExtensionNotConnected() {
    return (
        <InfoPanel spacing style={{alignSelf:'flex-start'}} image={<SquareImage size={200} src="/3d/puzzle.png"/>} title="Browser extension">
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

Select one of the sources below to start the process!

IMPORTANT: You may need to log in to your account before automatic process starts.
`

function HowItWorks() {
    return <InfoPanel header="How this works?" spacing image={<SquareImage size={120} src="/3d/puzzle.png"/>}>{HOW_COPY}</InfoPanel>
}

function ExtensionConnected() {
    return (
        <>
            <HowItWorks />
            <ExtensionStatus isConnected/>
        </>
    )
}

function ExtensionInitFailed() {
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
        case Status.Capturing: return <ExtensionConnected />
        case Status.InitFailed: return <ExtensionInitFailed />
        case Status.Incompatible: return <ExtensionVersionNotMatching />
    }
}

export default function Hotels() {
    return (
        <Page header="Stays">
            <ExtensionContent />
            <Stays />
            {isDEV() ? <Tours /> : null}
            <Footer />
        </Page>
    )
}