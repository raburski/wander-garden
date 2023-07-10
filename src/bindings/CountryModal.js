import Panel from 'components/Panel'
import ModalPage, { ModalPageButtons } from 'components/ModalPage'

import { VscVersions } from 'react-icons/vsc'
import countryFlagEmoji from 'country-flag-emoji'
import { styled } from 'goober'
import { useNavigate } from 'react-router'
import Button from 'components/Button'
import EmojiRow from 'components/EmojiRow'
import { useTimelineGroups } from 'domain/timeline'
import { getFormattedDate } from 'date'

const Flag = styled('span')`
    margin-bottom: -5px;
    margin-right: 12px;
    font-size: 42px;
`

function useCountryStatistics(countryCode) {
    const [groups] = useTimelineGroups()
    if (!countryCode || !groups) return undefined

    const cc = countryCode.toLowerCase()
    const countryGroups = groups.filter(group => group.highlights ? group.highlights.some(h => h.location.cc.toLowerCase() === cc) : false)
    if (countryGroups.length === 0) return {}

    const recentGroup = countryGroups[0]
    const firstGroup = countryGroups[countryGroups.length - 1]

    const recentPhase = recentGroup.phases.find(p => p?.location?.cc.toLowerCase() === cc)
    const reversedFirstPhases = [...firstGroup.phases].reverse()
    const firstPhase = reversedFirstPhases.find(p => p?.location?.cc.toLowerCase() === cc)

    return {
        // TODO: this show FIRST checkin in given hotel instead of last day in it
        lastVisit: {
            group: recentGroup,
            phase: recentPhase,
        },
        firstVisit: {
            group: firstGroup,
            phase: firstPhase,
        },
        totalTrips: countryGroups.length,
    }
}

export default function CountryModal({ countryCode, onClickAway }) {
    const navigate = useNavigate()
    const stats = useCountryStatistics(countryCode)
    if (!countryCode) return null

    const onGoToTimeline = () => navigate(`/timeline?cc=${countryCode}`)
    const country = countryFlagEmoji.get(countryCode)
    const header = <><Flag>{country.emoji}</Flag>{country.name}</>

    console.log('stats', stats)
    return (
        <ModalPage isOpen={!!countryCode} header={header} onClickAway={onClickAway}>
            <Panel>
                {stats.firstVisit ? <EmojiRow to={`/timeline/${stats.firstVisit.group.id}`} emoji="❇️" value="First stay" right={getFormattedDate(stats.firstVisit.phase?.date)}/> : null}
                {stats.lastVisit ? <EmojiRow to={`/timeline/${stats.lastVisit.group.id}`} emoji="🕑" value="Last stay" right={getFormattedDate(stats.lastVisit.phase?.date)}/> : null}
                <EmojiRow emoji="🔁" value="Number of trips" right={stats.totalTrips}/>
            </Panel>
            <ModalPageButtons>
                <Button icon={VscVersions} onClick={onGoToTimeline}>Show in timeline</Button>
            </ModalPageButtons>
        </ModalPage>
    )
}
