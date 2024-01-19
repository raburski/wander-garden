import Panel from "components/Panel"
import { useCheckins } from "domain/swarm"
import Button from "components/Button"
import { TbDownload, TbCloudUpload, TbTrash } from 'react-icons/tb'
import { useAllStays } from "domain/stays"
import { downloadString, uploadFile } from "files"
import toast from "react-hot-toast"
import { styled } from "goober"
import Separator from "components/Separator"
import { useAllTitles } from "domain/titles"
import { useClearAll, useReplaceAll } from "domain/refresh"
import { useNotes } from "domain/notes"
import { useTours } from "domain/tours"
import { useFlights } from "domain/flights"

const COPY = `Manage everything Wander Garden is using to construct your timeline and statistics.`

const Buttons = styled('div')`
    display: flex;
    flex: 1;
    flex-direction: row;
`

function useDownloadAllData() {
    const [checkins] = useCheckins()
    const stays = useAllStays()
    const titles = useAllTitles()
    const notes = useNotes()
    const tours = useTours()
    const flights = useFlights()
    const allData = {
        stays,
        checkins,
        titles,
        notes,
        tours,
        flights,
    }

    return () => downloadString(JSON.stringify(allData), 'json', 'wander-garden-data.json')
}

function useUploadAllData() {
    const replaceAll = useReplaceAll()

    return async function uploadAllData() {
        const files = await uploadFile()
        const allData = JSON.parse(files)
        if (!window.confirm('Are you sure you want to REPLACE all wander garden data?')) return undefined
        await replaceAll(allData)
    }
}

function useClearAllData() {
    const clearAll = useClearAll()

    return async function clearAllData() {
        if (!window.confirm('Are you sure you want to CLEAR all wander garden data?')) return undefined

        await toast.promise(clearAll(), {
            loading: 'Clearing data...',
            success: 'Everything cleared!',
            error: 'Something went wrong...'
        })
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
