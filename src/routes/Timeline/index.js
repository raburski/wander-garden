import { useSearchParams } from "react-router-dom"
import { onlyUnique } from "array"
import { getDaysAndRangeText } from 'date'
import Page from "components/Page"
import { titleFromLocationHighlights, } from 'domain/timeline/groups'

import { useVisitedCountryCodes } from "domain/stats"

import NoTimelineContent from './NoTimelineContent'
import FiltersPanel from './FiltersPanel'
import usePersistedScroll from "hooks/usePersistedScroll"

import { useTrips } from "domain/trips"
import { useTitle } from "domain/titles"
import Footer from "components/Footer"
import TripPanelSmall from "./TripPanel.small"
import TripPanelLarge from "./TripPanel.large"
import { styled } from "goober"
import moment from "moment"
import { useSetting } from "domain/settings"
import Segment from "components/Segment"

function TripPanel({ mode, ...props }) {
    return mode === "small" ? <TripPanelSmall {...props}/> : <TripPanelLarge {...props}/>
}

function Trip({ trip, mode }) {
    const title = useTitle(trip && trip.id)
    const highlights = trip.highlights.reversed()
    const locationTitle = titleFromLocationHighlights(highlights)
    const countryCodes = highlights.map(highlight => highlight.location.cc).filter(onlyUnique).reversed()
    const [days, range] = getDaysAndRangeText(trip.since, trip.until)

    return (
        <TripPanel
            mode={mode}
            to={`/timeline/${trip.id}`}
            title={title ? title : locationTitle}
            subtitle={title ? locationTitle : null}
            countryCodes={countryCodes}
            days={days}
            range={range}
        />
    )
}

const TripsContainer = styled('div')`
    display: flex;
    flex-direction: column;
`

function groupByYear(trips) {
    if (!trips) return {}
    return trips.reduce((acc, trip) => {
        const year = moment(trip.since).get('year')
        acc[year] = acc[year] ? [...acc[year], trip] : [trip]
        return acc
    }, {})
}

const YearContainer = styled('div')`
    display: flex;
    flex-direction: column;
    align-self: stretch;
`

const YearTripsContainer = styled('div')`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
`

const YearTitle = styled('h2')`
    color: ${props => props.theme.text};
`

const ModeSegment = styled(Segment)`
    margin-top: -14px;
`

function YearGroup({ year, trips, mode }) {
    return (
        <YearContainer>
            <YearTitle>{year}</YearTitle>
            <YearTripsContainer>
                {trips.map(trip => <Trip key={trip.id} trip={trip} mode={mode}/>)}
            </YearTripsContainer>
        </YearContainer>
    )
}


function Trips({ selectedCountryCode, mode }) {
    const trips = useTrips()
    const filteredTrips = selectedCountryCode ? trips.filter(trip => trip.highlights.find(h => h.location.cc.toLowerCase() === selectedCountryCode)) : trips
    const groupedTrips = groupByYear(filteredTrips)
    const years = Object.keys(groupedTrips).sort().reverse()
    return (
        <TripsContainer>
            {years.map(year => (
                <YearGroup key={year} year={year} trips={groupedTrips[year]} mode={mode}/>
            ))}
        </TripsContainer>
    )
}

const PERSIST_SCROLL_KEY = 'timeline'
function TimelineContent({ countryCodes, timelineMode }) {
    usePersistedScroll(PERSIST_SCROLL_KEY)
    const [params] = useSearchParams()
    const selectedCountryCode = params.get('cc')?.toLowerCase()

    return (
        <>
            <FiltersPanel
                countryCodes={countryCodes}
                selectedCountryCode={selectedCountryCode}
            />
            <Trips mode={timelineMode} selectedCountryCode={selectedCountryCode}/>
        </>
    )
}

const MODE_TITLES = ["🏳️", "🏞️"]
export default function TimelinePage(props) {
    const countryCodes = useVisitedCountryCodes()
    const [timelineMode, setTimelineMode] = useSetting('timeline_mode', 'small')
    const selectedModeIndex = timelineMode === 'small' ? 0 : 1
    const onModeChange = (index) => {
        setTimelineMode(index === 0 ? 'small' : 'large')
    }

    return (
        <Page header="Timeline" right={<ModeSegment onClick={onModeChange} titles={MODE_TITLES} selectedIndex={selectedModeIndex}/>} {...props}>
            {countryCodes.length === 0 ? <NoTimelineContent /> : <TimelineContent countryCodes={countryCodes} timelineMode={timelineMode}/>}
            <Footer />
        </Page>
    )
}
