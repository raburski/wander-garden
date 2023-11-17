import { useState } from 'react'
import toast from 'react-hot-toast'
import { useCheckins, useLastUpdated, useToken } from 'domain/swarm'
import { fetchCheckins, UnauthorizedError } from './API'
import moment from 'moment'
import useRefresh from 'domain/refresh'

export function useFetchCheckins() {
    const [checkins, setCheckins] = useCheckins()
    const [_, setLastUpdated] = useLastUpdated()
    const [token, setToken] = useToken()
    const latestCheckinIDs = [checkins[0], checkins[1], checkins[2]].filter(Boolean).map(c => c.id)

    return async function fetchCheckinsHook() {
        try {
            const fetchedCheckins = await fetchCheckins(token, latestCheckinIDs)
            const newCheckins = [
                ...fetchedCheckins,
                ...checkins,
            ]
            await setCheckins(newCheckins)
            await setLastUpdated(moment())

        } catch (e) {
            if (e === UnauthorizedError) {
                await setToken(null)
                alert('Your swarm session has expired. Please authenticate again in settings!')
            }
            throw e
        }
    }
}

function toastSandwich(fnReturningPromise) {
    return () => toast.promise(
        fnReturningPromise(),
        {
            loading: 'Fetching new checkins...',
            success: <b>List updated sucessfully!</b>,
            error: <b>Could not update the list...</b>,
        }
    )
}

export function useFetchSwarm() {
    const [isFetching, setFetching] = useState(false)
    const fetchCheckins = useFetchCheckins()
    const refresh = useRefresh()

    async function fetch() {
        setFetching(true)
        await fetchCheckins()
        await refresh()
        setFetching(false)
    } 
    return [isFetching, fetch]
}

export function useToastedFetchSwarm() {
    const [isFetching, fetchSwarm] = useFetchSwarm()
    return [toastSandwich(fetchSwarm), isFetching]
}