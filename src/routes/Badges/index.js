import { useState } from 'react'
import { useRegionalBadges } from 'domain/badges'
import Page from 'components/Page'
import Panel from 'components/Panel'
import Badge from 'components/Badge'
import BadgeDetailsModal from 'components/BadgeDetailsModal'

const contentStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    maxWidth: 936,
    padding: 6,
}

export default function Badges() {
    const [selectedBadge, setSelectedBadge] = useState()
    const regionalBadges = useRegionalBadges()
    return (
        <Page header="Badges">
            <Panel header="Regions of the Earth" contentStyle={contentStyle}>
                {regionalBadges.map(badge => <Badge name={badge.name} emoji={badge.emoji} active={badge.acquired} inactive={!badge.acquired} key={badge.name} onClick={() => setSelectedBadge(badge)}/>)}
                <BadgeDetailsModal
                    selectedBadge={selectedBadge}
                    onClickAway={() => setSelectedBadge(null)}
                />
            </Panel>
        </Page>
    )
}