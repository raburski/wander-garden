import Logo from "./Logo"
import ContentRow from "components/ContentRow";
import Panel from "components/Panel";
import { useShowCaptureStartModal } from "domain/tours";
import { TourLogoURL, TourName, TourType } from "domain/tours/types";

export default function Tours({ ...props }) {
    const showCaptureStartModal = useShowCaptureStartModal()

    const createSelectTourType = (tourType) => function onStayTypeSelect() {
        showCaptureStartModal(tourType)
    }

    return (
        <Panel header="Tours" {...props}>
            <ContentRow image={<Logo src={TourLogoURL[TourType.GetYourGuide]}/>} title={TourName[TourType.GetYourGuide]} onClick={createSelectTourType(TourType.GetYourGuide)}/>
            <ContentRow image={<Logo src={TourLogoURL[TourType.TripAdvisor]}/>} title={TourName[TourType.TripAdvisor]} onClick={createSelectTourType(TourType.TripAdvisor)}/>
        </Panel>
    )
}