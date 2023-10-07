import { useState } from 'react'
import { useRegionalBadges, useReligionBadges } from 'domain/badges'
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
    const religionBadges = useReligionBadges()
    return (
        <Page header="Badges">
            <Panel header="Regions" contentStyle={contentStyle}>
                {regionalBadges.map(badge => <Badge name={badge.name} emoji={badge.emoji} active={badge.acquired} inactive={!badge.acquired} key={badge.name} onClick={() => setSelectedBadge(badge)}/>)}
            </Panel>
            <Panel header="Religions" contentStyle={contentStyle}>
                {religionBadges.map(badge => <Badge name={badge.name} emoji={badge.emoji} active={badge.acquired} inactive={!badge.acquired} key={badge.name} onClick={() => setSelectedBadge(badge)}/>)}
            </Panel>
            <BadgeDetailsModal
                selectedBadge={selectedBadge}
                onClickAway={() => setSelectedBadge(null)}
            />
        </Page>
    )
}