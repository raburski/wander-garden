import Page from "components/Page"
import InfoPanel from "components/InfoPanel"
import SquareImage from 'components/SquareImage'
import { useIsConnected, useIsMatchingVersion } from 'domain/extension'
import OnlineDot from './OnlineDot'
import Booking from './Booking'
import ExtensionVersionNotMatching from './VersionMismatch'
import WebStoreButton from "./WebStoreButton"

const COPY = `In order to enhance your dataset you can install garden browser extension. It will help you import your booking.com, airbnb and agoda bookings.

`
function ExtensionNotConnected() {
    return (
        <InfoPanel spacing style={{alignSelf:'flex-start', whiteSpace: 'pre-wrap'}} image={<SquareImage size={200} src="/3d/puzzle.png"/>}>
            {COPY}
            <WebStoreButton />
        </InfoPanel>
    )
}

function ExtensionStatus() {
    return (
        <InfoPanel header="Status" spacing image={<OnlineDot />}>
            Connected
        </InfoPanel>
    )
}

function ExtensionConnected() {
    const isMatchingVersion = useIsMatchingVersion()
    return (
        <>
            <ExtensionStatus />
            {isMatchingVersion ? null : <ExtensionVersionNotMatching />}
            {isMatchingVersion ? <Booking /> : null}
        </>
    )
}

export default function Extension() {
    const isConnected = useIsConnected()
    return (
        <Page header="Browser extension">
            {isConnected ? <ExtensionConnected /> : <ExtensionNotConnected />}
        </Page>
    )
}