import { useState } from 'react'
import toast from 'react-hot-toast'
import { useFetchCheckins } from 'domain/swarm'
import { useRefreshHomes } from 'domain/homes'
import { useRefreshTimeline } from 'domain/timeline'
import Button from 'components/Button'
import { VscSync } from 'react-icons/vsc'

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

function useFetchSwarm(refreshHomes, refreshTimeline) {
    const [isFetching, setFetching] = useState(false)
    const fetchCheckins = useFetchCheckins()
    function fetch() {
        setFetching(true)
        function onLoaded() {
            refreshHomes()
            refreshTimeline()
            setFetching(false)
        }
        return fetchCheckins().then(onLoaded)
    } 
    return [isFetching, fetch]
}

export default function FetchCheckinsButton() {
    const refreshHomes = useRefreshHomes()
    const refreshTimeline = useRefreshTimeline()
    const [isFetching, fetchSwarm] = useFetchSwarm(refreshHomes, refreshTimeline)
    const fetch = toastSandwich(fetchSwarm)
    return <Button icon={VscSync} disabled={isFetching} onClick={fetch}>{isFetching ? 'Fetching checkins...' : 'Update checkins'}</Button>
}