import { useState } from 'react'
import toast from 'react-hot-toast'
import { _checkins } from '../../swarm/singletons'
import Button from '../../components/Button'
import { VscSync } from 'react-icons/vsc'

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
        function onLoaded() {
            setFetching(false)
            // TODO: instead of reloading whole page simply update data source
            window.location.reload()
        }
        return onFetchSwarm().then(onLoaded)
    }

    return [isFetching, fetch]
}

export default function FetchCheckinsButton() {
    const [isFetching, fetch] = useFetchSwarm()
    return <Button icon={VscSync} disabled={isFetching} onClick={fetch}>{isFetching ? 'Fetching checkins...' : 'Update checkins'}</Button>
}