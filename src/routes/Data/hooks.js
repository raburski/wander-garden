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
        case 0: return booking.length > 0 ? () => downloadString(JSON.stringify(booking), 'json', 'booking.json') : undefined
        case 1: return airbnb.length > 0 ? () => downloadString(JSON.stringify(airbnb), 'json', 'airbnb.json') : undefined
        case 2: return agoda.length > 0 ? () => downloadString(JSON.stringify(agoda), 'json', 'agoda.json') : undefined
        case 3: return swarm.length > 0 ? () => downloadString(JSON.stringify(swarm), 'json', 'swarm.json') : undefined
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
                case 0: clearBookingData().then(() => refreshTimeline()); break
                case 1: clearAirbnbData().then(() => refreshTimeline()); break
                case 2: clearAgodaData().then(() => refreshTimeline()); break
                case 3: clearSwarmData().then(() => {
                    console.log('clear swarm refresh?')
                    refreshTimeline()
                    console.log('refreshed!')
                }); break
                default: break
            }
        }
    }
}

export function useRefresh(index) {
    const showCaptureStartModal = useShowCaptureStartModal()
    const [fetchSwarm] = useToastedFetchSwarm()
    switch (index) {
        case 0: return () => showCaptureStartModal(StayType.Booking)
        case 1: return () => showCaptureStartModal(StayType.Airbnb)
        case 2: return () => showCaptureStartModal(StayType.Agoda)
        case 3: return fetchSwarm
        default: return undefined
    }
}