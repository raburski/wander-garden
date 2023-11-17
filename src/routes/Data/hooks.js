import { downloadString, uploadFile } from 'files'
import { useCheckins, useClearData as useClearSwarmData, isSwarmData, useShowUpdateModal, useIsAuthenticated } from 'domain/swarm'
import toast from 'react-hot-toast'
import { TITLES } from './consts'
import { isStayData, isStayType, StayType, useClearStays, useShowCaptureStartModal, useStartFileImport, useStays } from 'domain/stays'
import useRefresh from 'domain/refresh'

function getStayTypeForIndex(index) {
    switch (index) {
        case 0: return StayType.Booking
        case 1: return StayType.Airbnb
        case 2: return StayType.Agoda
        case 3: return StayType.Travala
        case 4: return StayType.Custom
        default: return undefined
    }
}

export function useDownload(index) {
    const stayType = getStayTypeForIndex(index) 

    const [swarm] = useCheckins()
    const stays = useStays(stayType)

    if (stays) {
        return stays.length > 0 ? () => downloadString(JSON.stringify(stays), 'json', `${stayType}.json`) : undefined
    } else {
        return swarm.length > 0 ? () => downloadString(JSON.stringify(swarm), 'json', 'swarm.json') : undefined
    }
}

async function uploadSwarmCheckins(items, setCheckins, onFinish) {
    async function process() {
        await setCheckins(items)
        await onFinish()
    }
    if (items.length > 0 && window.confirm(`${items.length} items found. Are you sure you want to REPLACE currently stored checkins?`)) {
        toast.promise(
            process(),
            {
                loading: 'Processing checkin data...',
                success: 'Data imported!',
                error: 'Data import failed...',
            }
        )
    }
}

export function useUpload() {
    const refresh = useRefresh()
    const startFileImport = useStartFileImport()

    const [_, setCheckins] = useCheckins()

    return async function onUploadFile() {
        const files = await uploadFile()
        const items = JSON.parse(files)

        if (isSwarmData(items)) {
            await uploadSwarmCheckins(items, setCheckins, refresh)
        } else if (isStayType(items) || isStayData(items)) {
            startFileImport(items)
        } else {
            alert('Data does not seem to be in any recognised format!')
        }
    }
}

export function useTrash(index) {
    const stayType = getStayTypeForIndex(index)
    const refresh = useRefresh()
    const clearStayData = useClearStays(stayType)
    const clearSwarmData = useClearSwarmData()

    return () => {
        if (window.confirm(`Are you sure you want to delete all ${TITLES[index]} data?`) && window.confirm(`Are you REALLY sure you want to CLEAN IT?`)) {
            if (clearStayData) {
                clearStayData().then(() => refresh())
            } else {
                clearSwarmData().then(() => {
                    console.log('clear swarm refresh?')
                    refresh()
                    console.log('refreshed!')
                })
            }
        }
    }
}

export function useCapture(index) {
    const isSwarmAuthenticated = useIsAuthenticated()
    const showCaptureStartModal = useShowCaptureStartModal()
    const showUpdateModal = useShowUpdateModal()
    const stayType = getStayTypeForIndex(index) 
    if (stayType === StayType.Custom) {
        return undefined
    } else if (stayType) {
        return () => showCaptureStartModal(stayType)
    } else {
        return isSwarmAuthenticated ? showUpdateModal : undefined
    }
}