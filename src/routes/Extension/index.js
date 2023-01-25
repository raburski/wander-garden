import Page from "components/Page"
import InfoPanel from "components/InfoPanel"
import { useIsConnected } from 'domain/extension'
import OnlineDot from './OnlineDot'
import Booking from './Booking'

function ExtensionNotConnected() {
    return (
        <InfoPanel spacing style={{alignSelf:'flex-start'}} >
            In order to enhance your dataset you can install garden browser extension. It will help you import your booking.com, airbnb and agoda bookings.
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
    return (
        <>
            <ExtensionStatus />
            <Booking />
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