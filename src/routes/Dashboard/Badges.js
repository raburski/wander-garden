import Panel from '../../components/Panel'
import { useState } from 'react'
import { useAcquiredBadges } from 'domain/badges'
import Badge from 'components/Badge'
import BadgeDetailsModal from 'components/BadgeDetailsModal'

const contentStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    maxWidth: 520,
    padding: 6,
}

export default function Badges() {
    const [selectedBadge, setSelectedBadge] = useState()
    const verifiedBadges = useAcquiredBadges()
    if (verifiedBadges.length <= 0) { return null }
    
    return (
        <Panel header="Collected badges" contentStyle={contentStyle} margin>
            {verifiedBadges.map(badge => <Badge name={badge.name} emoji={badge.emoji} key={badge.name} onClick={() => setSelectedBadge(badge)}/>)}
            <BadgeDetailsModal
                selectedBadge={selectedBadge}
                onClickAway={() => setSelectedBadge(null)}
            />
        </Panel>
    )
}