import Logo from "./Logo"
import ContentRow from "components/ContentRow";
import Panel from "components/Panel";
import { FlightLogoURL, FlightName, FlightType } from "domain/flights/types";
import { useShowCaptureStartModal } from "domain/flights";
import { isDEV } from "environment";

export default function Flights({ ...props }) {
    const showCaptureStartModal = useShowCaptureStartModal()

    const createSelectFlightType = (flightType) => function onStayTypeSelect() {
        showCaptureStartModal(flightType)
    }

    return (
        <Panel header="Flights" {...props}>
            {isDEV() ? <ContentRow image={<Logo src={FlightLogoURL[FlightType.Travala]}/>} title={FlightName[FlightType.Travala]} onClick={createSelectFlightType(FlightType.Travala)}/> : null}
            <ContentRow image={<Logo src={FlightLogoURL[FlightType.MilesAndMore]}/>} title={FlightName[FlightType.MilesAndMore]} onClick={createSelectFlightType(FlightType.MilesAndMore)}/>
            {isDEV() ? <ContentRow image={<Logo src={FlightLogoURL[FlightType.Ryanair]}/>} title={FlightName[FlightType.Ryanair]} onClick={createSelectFlightType(FlightType.Ryanair)}/> : null}
        </Panel>
    )
}