import { useLastUpdated, useIsAuthenticated } from '../../domain/swarm'
import Panel from '../../components/Panel'
import InfoPanel from '../../components/InfoPanel'
import { ResponsiveSquareImage } from '../../components/SquareImage'
import FetchCheckinsButton from '../../bindings/swarm/FetchCheckinsButton'
import moment from 'moment'
import EmojiRow from '../../components/EmojiRow'

function SwarmUpdateRequiredPanel() {
    return (
        <InfoPanel 
            header="Swarm"
            spacing
            title="Your data may be outdated..."
            image={<ResponsiveSquareImage src="/3d/beegarden1.png"/>}
        >
            <FetchCheckinsButton />
        </InfoPanel>
    )
}

function SwarmDefaultPanel({ lastUpdated }) {
    const daysAgo = lastUpdated.diff(moment(), 'days')
    const text = daysAgo < 2 ? 'Recently updated...' : `Last updated ${daysAgo} days ago...`

    return <Panel header="Swarm"><EmojiRow emoji="✅" value={text} to="swarm"/></Panel>
}

export default function Swarm() {
    const [lastUpdated] = useLastUpdated()

    const shouldUpdate = !lastUpdated || lastUpdated.diff(moment(), 'days') > 7
    if (shouldUpdate) {
        return <SwarmUpdateRequiredPanel />
    }

    return <SwarmDefaultPanel lastUpdated={lastUpdated}/>
}
