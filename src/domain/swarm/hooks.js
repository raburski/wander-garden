import { useState } from 'react'
import toast from 'react-hot-toast'
import { useCheckins, useLastUpdated, useToken } from 'domain/swarm'
import { useRefreshHomes } from 'domain/homes'
import { useRefreshTimeline } from 'domain/timeline'
import { fetchCheckins, UnauthorizedError } from './API'
import moment from 'moment'

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

    const refreshHomes = useRefreshHomes()
    const refreshTimeline = useRefreshTimeline()

    function fetch() {
        setFetching(true)
        function onLoaded() {
            setFetching(false)
        }
        return fetchCheckins()
            .then(() => refreshHomes())
            .then(() => refreshTimeline())
            .then(onLoaded)
    } 
    return [isFetching, fetch]
}

export function useToastedFetchSwarm() {
    const [isFetching, fetchSwarm] = useFetchSwarm()
    return [toastSandwich(fetchSwarm), isFetching]
}