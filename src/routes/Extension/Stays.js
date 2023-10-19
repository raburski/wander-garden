import { StayType, StayName, StayLogoURL, useShowCaptureStartModal } from 'domain/stays'
import Panel from "components/Panel"
import { styled } from "goober"
import ContentRow from "components/ContentRow"

const Logo = styled('img')`
    width: 32px;
    height: 32px;
    padding: 6px;
`

export default function Stays({ ...props }) {
    const showCaptureStartModal = useShowCaptureStartModal()

    const createSelectStayType = (stayType) => function onStayTypeSelect() {
        showCaptureStartModal(stayType)
    }

    return (
        <Panel {...props}>
            <ContentRow image={<Logo src={StayLogoURL[StayType.Booking]}/>} title={StayName[StayType.Booking]} onClick={createSelectStayType(StayType.Booking)}/>
            <ContentRow image={<Logo src={StayLogoURL[StayType.Airbnb]}/>} title={StayName[StayType.Airbnb]} onClick={createSelectStayType(StayType.Airbnb)}/>
            <ContentRow image={<Logo src={StayLogoURL[StayType.Agoda]}/>} title={StayName[StayType.Agoda]} onClick={createSelectStayType(StayType.Agoda)}/>
            <ContentRow image={<Logo src={StayLogoURL[StayType.Travala]}/>} title={`[WIP] ${StayName[StayType.Travala]}`} onClick={createSelectStayType(StayType.Travala)}/>
        </Panel>
    )
}