import { useState } from 'react'
import toast from 'react-hot-toast'
import { _checkins } from '../../swarm/singletons'
import Button from '../../components/Button'

function onFetchSwarm() {
    const fetchCheckins = _checkins.fetch()
    return toast.promise(
        fetchCheckins,
        {
            loading: 'Fetching new checkins...',
            success: <b>List updated sucessfully!</b>,
            error: <b>Could not update the list...</b>,
        }
    )
}

function useFetchSwarm() {
    const [isFetching, setFetching] = useState(false)
    function fetch() {
        setFetching(true)
        return onFetchSwarm().then(() => setFetching(false))
    }

    return [isFetching, fetch]
}

export default function FetchCheckinsButton() {
    const [isFetching, fetch] = useFetchSwarm()
    return <Button disabled={isFetching} onClick={fetch}>{isFetching ? 'Fetching checkins...' : 'Fetch swarm checkins'}</Button>
}