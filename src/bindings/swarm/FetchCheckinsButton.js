import Button from 'components/Button'
import { VscSync } from 'react-icons/vsc'
import { useToastedFetchSwarm } from 'domain/swarm/hooks'


export default function FetchCheckinsButton() {
    const [fetch, isFetching] = useToastedFetchSwarm()
    return <Button icon={VscSync} disabled={isFetching} onClick={fetch}>{isFetching ? 'Fetching checkins...' : 'Update checkins'}</Button>
}