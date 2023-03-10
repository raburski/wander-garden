import { downloadString, uploadFile } from 'files'
import { useCheckins, useClearData as useClearSwarmData, isSwarmData } from 'domain/swarm'
import { useBookingStays, useClearData as useClearBookingData, isBookingData } from 'domain/bookingcom'
import { useAirbnbStays, useClearData as useClearAirbnbData, isAirbnbData } from 'domain/airbnb'
import toast from 'react-hot-toast'
import { isAgodaData, useAgodaStays, useClearData as useClearAgodaData } from "domain/agoda"
import { TITLES } from './consts'

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

function createFileUpload(verifyData, setData) {
    return () => uploadFile().then(files => {
        const items = JSON.parse(files)
        if (!verifyData(items)) {
            alert('Data does not seem to be in a correct format...')
            return
        }
        if (items.length > 0 && window.confirm(`${items.length} items found. Are you sure you want to REPLACE currently stored ones?`)) {
            setData(items)
            toast.success('Data imported!')
        }
    }).catch(() => alert('Data does not seem to be in a correct format...'))
}

export function useUpload(index) {
    const [_, setCheckins] = useCheckins()
    const [__, setBookings] = useBookingStays()
    const [___, setAirbnb] = useAirbnbStays()
    const [____, setAgoda] = useAgodaStays()

    switch (index) {
        case 0: return createFileUpload(isSwarmData, setCheckins)
        case 1: return createFileUpload(isBookingData, setBookings)
        case 2: return createFileUpload(isAirbnbData, setAirbnb)
        case 2: return createFileUpload(isAgodaData, setAgoda)
    }
}

export function useTrash(index) {
    const clearSwarmData = useClearSwarmData()
    const clearBookingData = useClearBookingData()
    const clearAirbnbData = useClearAirbnbData()
    const clearAgodaData = useClearAgodaData()

    return () => {
        if (window.confirm(`Are you sure you want to delete all ${TITLES[index]} data?`) && window.confirm(`Are you REALLY sure you want to CLEAN IT?`)) {
            switch (index) {
                case 0: clearSwarmData(); break
                case 1: clearBookingData(); break
                case 2: clearAirbnbData(); break
                case 2: clearAgodaData(); break
                default: break
            }
        }
    }
}