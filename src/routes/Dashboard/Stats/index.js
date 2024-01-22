import Panel from "components/Panel"
import { useStats } from "domain/stats"
import { styled } from "goober"
import { MdFavoriteBorder, MdFlag, MdHotel, MdOutlineFlag, MdOutlineTimer } from "react-icons/md"
import { TbCalendar, TbPlaneDeparture, TbWorld } from "react-icons/tb"
import { useNavigate } from "react-router"
import { CountriesModal } from "./CountriesModal"
import { useState } from "react"
import countryFlagEmoji from "country-flag-emoji"
import { RegionsModal } from "./RegionsModa"
import { SeasonsModal } from "./SeasonsModal"
import { FavouriteCountriesModal } from "./FavouriteCountriesModal"


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
    display: flex;
    flex-basis: 40px;
    min-width: 40px;
    font-size: 32px;
    margin: 4px;
    padding-right: 4px;
    font-family: Primary;
    justify-content: center;

`

const Title = styled('div')`
    display: flex;
    flex-wrap: wrap;
    font-size: 10px;
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

const STAT = {
    VISITED_COUNTRIES: 'vis_countries',
    FAVOURITE_REGIONS: 'fav_regions',
    FAVOURITE_SEASONS: 'fav_seasons',
    FAVOURITE_COUNTRY: 'fav_country',
}

export default function Stats() {
    const [statModalOpen, setStatModalOpen] = useState()
    const navigate = useNavigate()
    const stats = useStats()

    if (!stats || Object.keys(stats).length === 0) return null

    const favouriteRegionEmoji = stats.favouriteRegions?.first()?.emoji
    const favouriteSeasonEmoji = stats.favouriteSeasons?.first()?.emoji
    const favouriteCountryEmoji = stats.favouriteCountries?.first()?.emoji

    const goToTrips = () => navigate('/timeline')
    const goToLongestTrip = () => navigate(`/timeline/${stats.longestTripID}`)
    const openCountries = () => setStatModalOpen(STAT.VISITED_COUNTRIES)
    const openFavRegion = () => setStatModalOpen(STAT.FAVOURITE_REGIONS)
    const openFavSeason = () => setStatModalOpen(STAT.FAVOURITE_SEASONS)
    const openFavCountry = () => setStatModalOpen(STAT.FAVOURITE_COUNTRY)

    const closeModal = () => setStatModalOpen(undefined)
    return (
        <Panel header="Stats" contentStyle={{flexDirection: 'row', flexWrap: 'wrap', padding: 6, justifyContent: 'space-evenly'}}>
            {stats.visitedCountries ? <Stat icon={MdOutlineFlag} title="countries visited" value={stats.visitedCountries.length} onClick={openCountries}/> :  null}
            {stats.totalTrips ? <Stat icon={TbPlaneDeparture} title="different trips" value={stats.totalTrips} onClick={goToTrips}/> : null}
            {stats.totalDaysAway ? <Stat icon={TbCalendar} title="days away" value={stats.totalDaysAway}/> : null}
            {stats.longestTripDays ? <Stat icon={MdOutlineTimer} title="days on longest trip" value={stats.longestTripDays} onClick={goToLongestTrip}/> : null}
            {stats.totalDifferentHotels ? <Stat icon={MdHotel} title="unique stays" value={stats.totalDifferentHotels}/> : null}
            {favouriteCountryEmoji ? <Stat icon={MdFavoriteBorder} title="most time spent" value={favouriteCountryEmoji} onClick={openFavCountry}/> : null}
            {favouriteSeasonEmoji ? <Stat icon={TbCalendar} title="favourite season" value={favouriteSeasonEmoji} onClick={openFavSeason}/> : null}
            {favouriteRegionEmoji ? <Stat icon={TbWorld} title="favourite region" value={favouriteRegionEmoji} onClick={openFavRegion}/> : null}

            <CountriesModal isOpen={statModalOpen === STAT.VISITED_COUNTRIES} onClickAway={closeModal}/>
            <RegionsModal favouriteRegions={stats.favouriteRegions} isOpen={statModalOpen === STAT.FAVOURITE_REGIONS} onClickAway={closeModal}/>
            <SeasonsModal favouriteSeasons={stats.favouriteSeasons} isOpen={statModalOpen === STAT.FAVOURITE_SEASONS} onClickAway={closeModal}/>
            <FavouriteCountriesModal favouriteCountries={stats.favouriteCountries} isOpen={statModalOpen === STAT.FAVOURITE_COUNTRY} onClickAway={closeModal}/>
        </Panel>
    )
}
