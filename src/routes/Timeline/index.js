import { useSearchParams } from "react-router-dom"
import { onlyUnique } from "array"
import { getDaysAndRangeText } from 'date'
import Page from "components/Page"
import { titleFromLocationHighlights, } from 'domain/timeline/groups'

import { useVisitedCountryCodes } from "domain/visitedCountries"

import NoTimelineContent from './NoTimelineContent'
import FiltersPanel from './FiltersPanel'
import usePersistedScroll from "hooks/usePersistedScroll"

import { useTrips } from "domain/trips"
import { useTitle } from "domain/titles"
import Footer from "components/Footer"
import TripPanel from "./TripPanel"
import { styled } from "goober"
import moment from "moment"

function Trip({ trip }) {
    const title = useTitle(trip && trip.id)
    const highlights = trip.highlights.reversed()
    const locationTitle = titleFromLocationHighlights(highlights)
    const countryCodes = highlights.map(highlight => highlight.location.cc).filter(onlyUnique).reversed()
    const [days, range] = getDaysAndRangeText(trip.since, trip.until)

    return (
        <TripPanel to={`/timeline/${trip.id}`}
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

function YearGroup({ year, trips }) {
    return (
        <YearContainer>
            <YearTitle>{year}</YearTitle>
            <YearTripsContainer>
                {trips.map(trip => <Trip key={trip.id} trip={trip} />)}
            </YearTripsContainer>
        </YearContainer>
    )
}


function Trips({ selectedCountryCode }) {
    const trips = useTrips()
    const filteredTrips = selectedCountryCode ? trips.filter(trip => trip.highlights.find(h => h.location.cc.toLowerCase() === selectedCountryCode)) : trips
    const groupedTrips = groupByYear(filteredTrips)
    const years = Object.keys(groupedTrips).sort().reverse()
    return (
        <TripsContainer>
            {years.map(year => (
                <YearGroup year={year} trips={groupedTrips[year]}/>
            ))}
        </TripsContainer>
    )
}

const PERSIST_SCROLL_KEY = 'timeline'
function TimelineContent({ countryCodes }) {
    usePersistedScroll(PERSIST_SCROLL_KEY)
    const [params] = useSearchParams()
    const selectedCountryCode = params.get('cc')?.toLowerCase()

    return (
        <>
            <FiltersPanel
                countryCodes={countryCodes}
                selectedCountryCode={selectedCountryCode}
            />
            <Trips selectedCountryCode={selectedCountryCode}/>
        </>
    )
}

export default function TimelinePage(props) {
    const countryCodes = useVisitedCountryCodes()

    return (
        <Page header="Timeline" {...props}>
            {countryCodes.length === 0 ? <NoTimelineContent /> : <TimelineContent countryCodes={countryCodes}/>}
            <Footer />
        </Page>
    )
}
