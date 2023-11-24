import Panel from "components/Panel"
import { useStats } from "domain/stats"
import { styled } from "goober"
import { MdFavoriteBorder, MdFlag, MdHotel, MdOutlineFlag, MdOutlineTimer } from "react-icons/md"
import { TbCalendar, TbPlaneDeparture, TbWorld } from "react-icons/tb"
import { useNavigate } from "react-router"
import { CountriesModal } from "./CountriesModal"
import { useState } from "react"
import countryFlagEmoji from "country-flag-emoji"


const StatContainer = styled('div')`
    display: flex;
    flex-direction: row;
    padding: 4px;
    padding-left: 8px;
    padding-right: 8px;
    margin: 2px;
    align-items: center;
    border-radius: 6px;
    width: 122px;
    cursor: ${props => props.onClick ? 'pointer' : 'default'};

    &:hover {
        background-color: ${props => props.theme.background.highlight};
    }
`

const Icon = styled('div')`
    display: flex;
    align-items: flex-start;
    font-size: 18px;
    width: 18px;
    height: 24px;
    margin-right: 4px;
    margin-top: -14px;
`

const Value = styled('div')`
    font-size: 32px;
    margin: 4px;
    margin-right: 8px;
    font-family: Primary;
`

const Title = styled('div')`
    font-size: 9px;
`

function Stat({ icon, value, title, onClick }) {
    const ActualIcon = icon
    const ico = ActualIcon ? <Icon><ActualIcon /></Icon> : null
    return (
        <StatContainer onClick={onClick}>
            {ico}
            <Value>{value}</Value>
            <Title>{title}</Title>
        </StatContainer>
    )
}

export default function Stats() {
    const [isCountriesOpen, setCountriesOpen] = useState()
    const navigate = useNavigate()
    const stats = useStats()

    if (!stats || Object.keys(stats).length === 0) return null

    const mostTimeSpentCountry = stats.mostTimeSpentCountry ? countryFlagEmoji.get(stats.mostTimeSpentCountry) : undefined
    console.log('stats', stats)

    const goToTrips = () => navigate('/timeline')
    const openCountries = () => setCountriesOpen(true)
    const closeCountries = () => setCountriesOpen(false)
    const goToMostVisitedTrips = () => navigate(`/timeline?cc=${stats.mostTimeSpentCountry}`)
    return (
        <Panel header="Stats" contentStyle={{flexDirection: 'row', flexWrap: 'wrap', padding: 6, justifyContent: 'space-evenly'}}>
            {stats.visitedCountries ? <Stat icon={MdOutlineFlag} title="countries visited" value={stats.visitedCountries.length} onClick={openCountries}/> :  null}
            {stats.totalTrips ? <Stat icon={TbPlaneDeparture} title="different trips" value={stats.totalTrips} onClick={goToTrips}/> : null}
            {stats.totalDaysAway ? <Stat icon={TbCalendar} title="total days away" value={stats.totalDaysAway}/> : null}
            {stats.longestTripDays ? <Stat icon={MdOutlineTimer} title="days on longest trip" value={stats.longestTripDays}/> : null}
            {stats.totalDifferentHotels ? <Stat icon={MdHotel} title="different hotel stays" value={stats.totalDifferentHotels}/> : null}
            {mostTimeSpentCountry ? <Stat icon={MdFavoriteBorder} title="most time spent" value={mostTimeSpentCountry.emoji} onClick={goToMostVisitedTrips}/> : null}
            {stats.favouriteTravelSeason ? <Stat icon={TbCalendar} title="favourite travel season" value={stats.favouriteTravelSeason}/> : null}
            {stats.favouriteRegion ? <Stat icon={TbWorld} title="favourite region" value={stats.favouriteRegion}/> : null}

            <CountriesModal isOpen={isCountriesOpen} onClickAway={closeCountries}/>
        </Panel>
    )
}
