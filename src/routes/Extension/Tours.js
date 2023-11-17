import Logo from "./Logo"
import ContentRow from "components/ContentRow";
import Panel from "components/Panel";

export default function Tours({ ...props }) {
    // const showCaptureStartModal = useShowCaptureStartModal()
    // const loadFromFile = useUploadAndAddData()

    const createSelectTourType = (stayType) => function onStayTypeSelect() {
        // showCaptureStartModal(stayType)
    }

    return (
        <Panel header="Tours" {...props}>
            <ContentRow image={<Logo src="/logo/getyourguide.svg"/>} title="GetYourGuide" onClick={createSelectTourType()}/>
            <ContentRow image={<Logo src="/logo/tripadvisor.svg"/>} title="TripAdvisor" onClick={createSelectTourType()}/>
        </Panel>
    )
}