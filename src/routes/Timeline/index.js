import { useSearchParams } from "react-router-dom"
import { onlyUnique } from "array"
import { getDaysAndRangeText } from 'date'
import CountryBar from "./CountryBar"
import Page from "components/Page"
import Panel from "components/Panel"
import { titleFromLocationHighlights, } from 'domain/timeline/groups'

import { useVisitedCountryCodes } from "domain/timeline"

import NoTimelineContent from './NoTimelineContent'
import FiltersPanel from './FiltersPanel'
import usePersistedScroll from "hooks/usePersistedScroll"

import { useTrips, useTitle } from "domain/trips"

function Trip({ trip }) {
    const title = useTitle(trip && trip.id)
    const locationTitle = titleFromLocationHighlights(trip.highlights)
    const countryCodes = trip.highlights.map(highlight => highlight.location.cc).filter(onlyUnique).reverse()
    const [days, range] = getDaysAndRangeText(trip.since, trip.until)

    return (
        <CountryBar to={`/timeline/${trip.id}`}
            title={title ? title : locationTitle}
            subtitle={title ? locationTitle : null}
            countryCodes={countryCodes}
            days={days}
            range={range}
        />
    )
}

function Trips({ selectedCountryCode }) {
    const trips = useTrips()
    const filteredTrips = selectedCountryCode ? trips.filter(trip => trip.highlights.find(h => h.location.cc.toLowerCase() === selectedCountryCode)) : trips
    return (
        <Panel>
            {filteredTrips.map(trip => <Trip key={trip.id} trip={trip} />)}
        </Panel>
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
    const [countryCodes] = useVisitedCountryCodes()

    return (
        <Page header="Timeline" {...props}>
            {countryCodes.length === 0 ? <NoTimelineContent /> : <TimelineContent countryCodes={countryCodes}/>}
        </Page>
    )
}
