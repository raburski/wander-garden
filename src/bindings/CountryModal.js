import Panel from 'components/Panel'
import ModalPage, { ModalPageButtons } from 'components/ModalPage'

import { VscVersions } from 'react-icons/vsc'
import countryFlagEmoji from 'country-flag-emoji'
import { styled } from 'goober'
import { useNavigate } from 'react-router'
import Button from 'components/Button'
import EmojiRow from 'components/EmojiRow'
import { getFormattedDate } from 'date'
import { useTrips } from 'domain/trips'
import { useSetCountryTravelled, useVisitedCountryCodes } from 'domain/stats'

const Flag = styled('span')`
    margin-bottom: -5px;
    margin-right: 12px;
    font-size: 42px;
`

function useCountryStatistics(countryCode) {
    const trips = useTrips()
    if (!countryCode || !trips) return undefined

    const cc = countryCode.toLowerCase()
    const countryTrips = trips.filter(trip => trip.highlights ? trip.highlights.some(h => h.location.cc.toLowerCase() === cc) : false)
    if (countryTrips.length === 0) return {}

    const recentTrip = countryTrips[0]
    const firstTrip = countryTrips[countryTrips.length - 1]

    const recentPhase = recentTrip.phases.find(p => p?.stay?.location?.cc.toLowerCase() === cc)
    const reversedFirstPhases = [...firstTrip.phases].reverse()
    const firstPhase = reversedFirstPhases.find(p => p?.stay?.location?.cc.toLowerCase() === cc)

    return {
        // TODO: this show FIRST checkin in given hotel instead of last day in it
        lastVisit: {
            trip: recentTrip,
            phase: recentPhase,
        },
        firstVisit: {
            trip: firstTrip,
            phase: firstPhase,
        },
        totalTrips: countryTrips.length,
    }
}

export default function CountryModal({ countryCode, onClickAway }) {
    const navigate = useNavigate()
    const countryCodes = useVisitedCountryCodes()
    const stats = useCountryStatistics(countryCode)
    const setCountryTravelled = useSetCountryTravelled()
    if (!countryCode) return null

    const isCountryVisited = countryCodes.includes(countryCode)
    const onGoToTimeline = () => navigate(`/timeline?cc=${countryCode}`)
    const country = countryFlagEmoji.get(countryCode)
    const header = <><Flag>{country.emoji}</Flag>{country.name}</>

    return (
        <ModalPage isOpen={!!countryCode} header={header} onClickAway={onClickAway}>
            <Panel>
                {stats.firstVisit ? <EmojiRow to={`/timeline/${stats.firstVisit.trip.id}`} emoji="❇️" value="First stay" right={getFormattedDate(stats.firstVisit.phase?.since)}/> : null}
                {stats.lastVisit ? <EmojiRow to={`/timeline/${stats.lastVisit.trip.id}`} emoji="🕑" value="Last stay" right={getFormattedDate(stats.lastVisit.phase?.until)}/> : null}
                {stats.totalTrips ? 
                    <EmojiRow emoji="🔁" value="Number of trips" right={stats.totalTrips}/> : 
                    <EmojiRow emoji="🎒" value="I have travelled here" right={isCountryVisited ? '✅' : '⬜️'} onClick={() => setCountryTravelled(countryCode, !isCountryVisited)}/>
                }
            </Panel>
            <ModalPageButtons>
                <Button icon={VscVersions} onClick={onGoToTimeline}>Show in timeline</Button>
            </ModalPageButtons>
        </ModalPage>
    )
}
