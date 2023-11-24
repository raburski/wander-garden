import { StayType, StayName, StayLogoURL, useShowCaptureStartModal, useStartFileImport, useReplaceAllStays, isStayData } from 'domain/stays'
import Panel from "components/Panel"
import Logo from "./Logo"
import ContentRow from "components/ContentRow"
import toast from 'react-hot-toast'
import { isSwarmData, useCheckins, useClearData, useReplaceAllCheckins } from 'domain/swarm'
import { uploadFile } from 'files'
import { useReplaceAllTitles } from 'domain/titles'
import useRefresh from 'domain/refresh'

function useUploadAndAddData() {
    const replaceAllStays = useReplaceAllStays()
    const replaceAllTitles = useReplaceAllTitles()
    const replaceAllCheckins = useReplaceAllCheckins()
    const clearSwarmData = useClearData()
    const startFileImport = useStartFileImport()
    const refresh = useRefresh()

    return async function uploadAllData() {
        const file = await uploadFile()
        const allData = JSON.parse(file)

        const toastId = toast.loading('Loading new data...')
        if (isStayData(allData)) {
            await startFileImport(allData)
        } else if (isSwarmData(allData.checkins) && isStayData(allData.stays)) {
            await clearSwarmData()
            await replaceAllTitles(allData.titles)
            await replaceAllCheckins(allData.checkins)
            await replaceAllStays(allData.stays)
            // TODO: tours etc maybe?
            await refresh()
            toast.success('All uploaded!')
        } else {
            alert('Data does not seem to be in any recognised format!')
        }
        toast.dismiss(toastId)
    }
}

export default function Stays({ ...props }) {
    const showCaptureStartModal = useShowCaptureStartModal()
    const loadFromFile = useUploadAndAddData()

    const createSelectStayType = (stayType) => function onStayTypeSelect() {
        showCaptureStartModal(stayType)
    }

    return (
        <Panel header="Stays" {...props}>
            <ContentRow image={<Logo src={StayLogoURL[StayType.Booking]}/>} title={StayName[StayType.Booking]} onClick={createSelectStayType(StayType.Booking)}/>
            <ContentRow image={<Logo src={StayLogoURL[StayType.Airbnb]}/>} title={StayName[StayType.Airbnb]} onClick={createSelectStayType(StayType.Airbnb)}/>
            <ContentRow image={<Logo src={StayLogoURL[StayType.Agoda]}/>} title={StayName[StayType.Agoda]} onClick={createSelectStayType(StayType.Agoda)}/>
            <ContentRow image={<Logo src={StayLogoURL[StayType.Travala]}/>} title={`[WIP] ${StayName[StayType.Travala]}`} onClick={createSelectStayType(StayType.Travala)}/>
            <ContentRow image={<Logo src={StayLogoURL[StayType.Custom]}/>} title="Load from file..." onClick={loadFromFile}/>
        </Panel>
    )
}