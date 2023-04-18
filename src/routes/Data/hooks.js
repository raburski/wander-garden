import { downloadString, uploadFile } from 'files'
import { useCheckins, useClearData as useClearSwarmData, isSwarmData } from 'domain/swarm'
import { useBookingStays, useClearData as useClearBookingData } from 'domain/bookingcom'
import { useAirbnbStays, useClearData as useClearAirbnbData } from 'domain/airbnb'
import toast from 'react-hot-toast'
import { useAgodaStays, useClearData as useClearAgodaData } from "domain/agoda"
import { TITLES } from './consts'

import { useRefreshTimeline } from 'domain/timeline'
import { isStayData, isStayType } from 'domain/stay'
import { StayType, useShowCaptureStartModal, useStartFileImport } from 'domain/extension'
import { useToastedFetchSwarm } from 'domain/swarm/hooks'

export function useDownload(index) {
    const [swarm] = useCheckins()
    const [booking] = useBookingStays()
    const [airbnb] = useAirbnbStays()
    const [agoda] = useAgodaStays()

    switch (index) {
        case 0: return swarm.length > 0 ? () => downloadString(JSON.stringify(swarm), 'json', 'swarm.json') : undefined
        case 1: return booking.length > 0 ? () => downloadString(JSON.stringify(booking), 'json', 'booking.json') : undefined
        case 2: return airbnb.length > 0 ? () => downloadString(JSON.stringify(airbnb), 'json', 'airbnb.json') : undefined
        case 3: return agoda.length > 0 ? () => downloadString(JSON.stringify(agoda), 'json', 'agoda.json') : undefined
    }
}

async function uploadSwarmCheckins(items, setCheckins, onFinish) {
    try {
        if (items.length > 0 && window.confirm(`${items.length} items found. Are you sure you want to REPLACE currently stored checkins?`)) {
            await setCheckins(items)
            toast.success('Data imported!')
        }
    } catch (e) {
        alert(e.name)
    } finally {
        await onFinish()
    }
}

export function useUpload() {
    const refreshTimeline = useRefreshTimeline()
    const startFileImport = useStartFileImport()

    const [_, setCheckins] = useCheckins()

    return async function onUploadFile() {
        const files = await uploadFile()
        const items = JSON.parse(files)

        if (isSwarmData(items)) {
            await uploadSwarmCheckins(items, setCheckins, refreshTimeline)
        } else if (isStayType(items) || isStayData(items)) {
            startFileImport(items)
        } else {
            alert('Data does not seem to be in any recognised format!')
        }
    }
}

export function useTrash(index) {
    const refreshTimeline = useRefreshTimeline()

    const clearSwarmData = useClearSwarmData()
    const clearBookingData = useClearBookingData()
    const clearAirbnbData = useClearAirbnbData()
    const clearAgodaData = useClearAgodaData()

    return () => {
        if (window.confirm(`Are you sure you want to delete all ${TITLES[index]} data?`) && window.confirm(`Are you REALLY sure you want to CLEAN IT?`)) {
            switch (index) {
                case 0: clearSwarmData().then(() => {
                    console.log('clear swarm refresh?')
                    refreshTimeline()
                    console.log('refreshed!')
                }); break
                case 1: clearBookingData().then(() => refreshTimeline()); break
                case 2: clearAirbnbData().then(() => refreshTimeline()); break
                case 3: clearAgodaData().then(() => refreshTimeline()); break
                default: break
            }
        }
    }
}

export function useRefresh(index) {
    const showCaptureStartModal = useShowCaptureStartModal()
    const [fetchSwarm] = useToastedFetchSwarm()
    switch (index) {
        case 0: return fetchSwarm
        case 1: return () => showCaptureStartModal(StayType.Booking)
        case 2: return () => showCaptureStartModal(StayType.Airbnb)
        case 3: return () => showCaptureStartModal(StayType.Agoda)
        default: return undefined
    }
}