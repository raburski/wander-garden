import Panel from "components/Panel"
import { isSwarmData, useCheckins, useClearData } from "domain/swarm"
import Button from "components/Button"
import { TbDownload, TbCloudUpload, TbTrash } from 'react-icons/tb'
import { isStayData, useAllStays, useReplaceAllStays } from "domain/stays"
import { downloadString, uploadFile } from "files"
import toast from "react-hot-toast"
import { styled } from "goober"
import Separator from "components/Separator"

const COPY = `Manage everything Wander Garden is using to construct your timeline and statistics.`

const Buttons = styled('div')`
    display: flex;
    flex: 1;
    flex-direction: row;
`

function useDownloadAllData() {
    const [checkins] = useCheckins()
    const stays = useAllStays()
    const allData = {
        stays,
        checkins,
    }

    return () => downloadString(JSON.stringify(allData), 'json', 'wander-garden-data.json')
}

function useUploadAllData() {
    const replaceAllStays = useReplaceAllStays()
    const [_, setCheckins] = useCheckins()
    const clearSwarmData = useClearData()

    return async function uploadAllData() {
        const files = await uploadFile()
        const allData = JSON.parse(files)

        if (!window.confirm('Are you sure you want to REPLACE all wander garden data?')) return undefined

        if (isSwarmData(allData.checkins) && isStayData(allData.stays)) {
            const toastId = toast.loading('Loading new data...')
            await clearSwarmData()
            await setCheckins(allData.checkins)
            await replaceAllStays(allData.stays)
            toast.dismiss(toastId)
            toast.success('All uploaded!')
        } else {
            alert('Data does not seem to be in any recognised format!')
        }
    }
}

function useClearAllData() {
    const clearSwarmData = useClearData()
    const replaceAllStays = useReplaceAllStays()

    return async function clearAllData() {
        if (!window.confirm('Are you sure you want to CLEAR all wander garden data?')) return undefined

        const toastId = toast.loading('Clearing all data...')
        await clearSwarmData()
        await replaceAllStays([])
        toast.dismiss(toastId)
        toast.success('Everything cleared!')
    }
}

export default function DataPanel() {
    const download = useDownloadAllData()
    const upload = useUploadAllData()
    const clear = useClearAllData()

    return (
        <Panel header="Data" spacing>
            {COPY}
            <Separator />
            <Buttons>
                <Button onClick={download} icon={TbDownload}>Download all data</Button>
                <Separator />
                <Button onClick={upload} icon={TbCloudUpload}>Upload and replace all data</Button>
                <Separator />
                <Button onClick={clear} icon={TbTrash}>Clear all data</Button>
            </Buttons>
        </Panel>
    )
}