import { useLastUpdated, useIsAuthenticated } from '../../domain/swarm'
import Panel from '../../components/Panel'
import InfoPanel from '../../components/InfoPanel'
import SquareImage from '../../components/SquareImage'
import AuthenticateButton from '../../bindings/swarm/AuthenticateButton'
import FetchCheckinsButton from '../../bindings/swarm/FetchCheckinsButton'
import moment from 'moment'
import EmojiRow from '../../components/EmojiRow'

function SwarmAuthenticatePanel() {
    return (
        <InfoPanel 
            header="Swarm"
            spacing
            margin
            title="Connect your account"
            image={<SquareImage src="/3d/beegarden1.png"/>}
            containerStyle={{alignItems: 'center'}}
        >
            <AuthenticateButton />
        </InfoPanel>
    )
}

function SwarmUpdateRequiredPanel() {
    return (
        <InfoPanel 
            header="Swarm"
            spacing
            margin
            title="Your data may be outdated..."
            image={<SquareImage src="/3d/beegarden1.png"/>}
        >
            <FetchCheckinsButton />
        </InfoPanel>
    )
}

function SwarmDefaultPanel({ lastUpdated }) {
    const daysAgo = lastUpdated.diff(moment(), 'days')
    const text = daysAgo < 2 ? 'Recently updated...' : `Last updated ${daysAgo} days ago...`

    return <Panel header="Swarm" margin><EmojiRow emoji="✅" value={text} to="swarm"/></Panel>
}

export default function Swarm() {
    const isAuthenticated = useIsAuthenticated()
    const [lastUpdated] = useLastUpdated()
    if (!isAuthenticated) {
        return <SwarmAuthenticatePanel />
    }

    const shouldUpdate = !lastUpdated || lastUpdated.diff(moment(), 'days') > 7
    if (shouldUpdate) {
        return <SwarmUpdateRequiredPanel />
    }

    return <SwarmDefaultPanel lastUpdated={lastUpdated}/>
}
