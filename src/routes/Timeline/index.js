import { useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import countryFlagEmoji from "country-flag-emoji"
import { styled } from 'goober'
import { onlyUnique } from "../../array"
import { useCheckIns, _token } from "../../swarm/singletons"
import { onlyNonTransportation, venueEmoji } from '../../swarm/categories'
import { hasCity, hasState, isEqualCity, isEqualCountry, isEqualState} from '../../location'
import { getCategory } from "../../swarm/categories"
import CountryBar from "./CountryBar"
import Page from "../../components/Page"
import Button from "../../components/Button"
import colors from "../../colors"

const StyledToggleButton = styled('button')`
    background-color: #fafafa;
    border: 1px solid #ebebeb;
    border-radius: 4px;
    padding: 6px;
    padding-left: 8px;
    padding-right: 10px;
    cursor: pointer;
`

function ToggleButton({ checked, onClick, children }) {
    const icon = checked ? '🔳' : '⬜️'
    return <StyledToggleButton onClick={onClick}>{icon}&nbsp;&nbsp;{children}</StyledToggleButton>
}

const OptionsGroup = styled('div')`
    padding: 6px;
`

function Country({ location }) {
    const categories = location.states
        .reduce((checkins = [], state) => [...checkins, ...state.checkins], [])
        .flatMap(checkin => checkin.venue.categories)
        .map(category => category.id)
        .filter(onlyUnique)
        .map(getCategory)
        .filter(Boolean)
    return (
        <CountryBar
            name={location.country}
            code={location.cc}
            states={location.states.map(s => s.state)}
            categories={categories}
        />
    )
}


const EVENT_TYPE = {
    CHECKIN: 'CHECKIN',
    CHANGE_COUNTRY: 'CHANGE_COUNTRY',
    CHANGE_CITY: 'CHANGE_CITY',
    CHANGE_STATE: 'CHANGE_STATE',
}

class EventFactory {
    checkin(obj) {
        return {
            ...obj,
            type: EVENT_TYPE.CHECKIN,
        }
    }
    changeCountry(fromCheckin, toCheckin) {
        return {
            type: EVENT_TYPE.CHANGE_COUNTRY,
            from: fromCheckin.venue.location,
            to: toCheckin.venue.location,
        }
    }
    changeCity(fromCheckin, toCheckin) {
        return {
            type: EVENT_TYPE.CHANGE_CITY,
            from: fromCheckin.venue.location,
            to: toCheckin.venue.location,

            fromCheckin,
            toCheckin,
        }
    }
    changeState(fromCheckin, toCheckin) {
        return {
            type: EVENT_TYPE.CHANGE_STATE,
            from: fromCheckin.venue.location,
            to: toCheckin.venue.location,
        }
    }
}

const factory = new EventFactory()

function timelineFromCheckins(checkins) {
    if (!checkins) {
        return []
    }
    const timeline = []

    for (let i = 0; i < checkins.length; i++) {
        const prevCheckin = i > 0 ? checkins[i-1] : null
        const currentCheckin = checkins[i]
        if (i == 0) {
            timeline.push(factory.checkin(currentCheckin))
            continue
        }

        if (!isEqualCountry(prevCheckin, currentCheckin)) {
            timeline.push(factory.changeCountry(currentCheckin, prevCheckin))
        }
        if (hasState(currentCheckin) && hasState(prevCheckin) && !isEqualState(prevCheckin, currentCheckin)) {
            timeline.push(factory.changeState(currentCheckin, prevCheckin))
        }
        if (hasCity(currentCheckin) && hasCity(prevCheckin) && !isEqualCity(prevCheckin, currentCheckin)) {
            timeline.push(factory.changeCity(currentCheckin, prevCheckin))
        }
        timeline.push(factory.checkin(currentCheckin))
    }
    
    return timeline
}

function CheckinEvent({ event }) {
    return <div> {venueEmoji(event.venue)} {event.venue.name}</div>
}

function ChangeCityEvent({ event }) {
    return <div>Change city: {event.from.city} -&gt; {event.to.city} in {countryFlagEmoji.get(event.to.cc).emoji}</div>
}

function ChangeStateEvent({ event }) {
    return <div>Change state: {event.from.state} -&gt; {event.to.state}</div>
}

function ChangeCountryEvent({ event }) {
    return <div>Change country: {event.from.country} -&gt; {event.to.country}</div>
}

function CurrentlyInEvent({ event }) {
    return <div>Currently in: {event.venue.location.city}, {event.venue.location.country} {countryFlagEmoji.get(event.venue.location.cc).emoji}</div>
}

function TimelineEvent({ event }) {
    switch (event.type) {
        case EVENT_TYPE.CHECKIN: return <CheckinEvent event={event} />
        case EVENT_TYPE.CHANGE_CITY: return <ChangeCityEvent event={event} />
        case EVENT_TYPE.CHANGE_COUNTRY: return <ChangeCountryEvent event={event} />
        case EVENT_TYPE.CHANGE_STATE: return <ChangeStateEvent event={event} />
        default: return null
    }
}

function groupedTimeline(timeline) {
    if (!timeline || timeline.length === 0) return []
    const grouped = []
    let currentCountry = { ...timeline[0].venue.location, states: [] }
    let currentState = { ...timeline[0].venue.location, checkins: [] }

    function pushState() {
        if (currentState) {
            // TODO: Add timestamping
            // if (currentState.checkins.length > 0) {
            //     currentState.until = currentState.checkins.
            // }

            currentCountry.states.push(currentState)
            currentState = null
        }
    }
    function pushCountry() {
        grouped.push(currentCountry)
    }

    timeline.forEach(event => {
        switch (event.type) {
            case EVENT_TYPE.CHANGE_COUNTRY: {
                pushState()
                pushCountry()
                currentCountry = { ...event.from, states: [] }
            }
            case EVENT_TYPE.CHANGE_STATE: {
                pushState()
                currentState = { ...event.from, checkins: [] }
                break
            }
            case EVENT_TYPE.CHECKIN: {
                currentState.checkins.push(event)
                break
            }
        }
    })

    currentCountry.states.push(currentState)
    grouped.push(currentCountry)    

    return grouped
}

const AllFlagsContainer = styled('div')`
    display: flex;
    flex-direction: row;
    margin-top: 18px;
    font-size: 28px;
`

const StyledFlagButton = styled(Link)`
    display: flex;
    color: inherit;
    text-decoration: none;
    cursor: pointer;
    padding-left: 4px;
    padding-right: 4px;
    border-radius: 6px;

    &:hover {
        background-color: ${colors.neutral.highlight};
    }
`

function FlagButton({ selected, style, ...props }) {
    return <StyledFlagButton style={selected ? {backgroundColor: colors.neutral.dark} : {}} {...props}/>
}

function AllFlags({ countries = [], selectedCountryCode }) {
    const countryCodes = countries.map(country => country.cc).filter(onlyUnique)
    return <AllFlagsContainer>{countryCodes.map(cc => <FlagButton to={selectedCountryCode === cc.toLowerCase() ? `?` : `?cc=${cc.toLowerCase()}`} selected={selectedCountryCode == cc.toLowerCase()}>{countryFlagEmoji.get(cc).emoji}</FlagButton>)}</AllFlagsContainer>
}

export default function Timeline() {
    const [params] = useSearchParams()
    const selectedCountryCode = params.get('cc')?.toLowerCase()
    const [filterTransport, setFilterTransport] = useState(false)
    const toggleFilterTransport = () => setFilterTransport(!filterTransport)

    const checkins = useCheckIns()
    const timeline = timelineFromCheckins(filterTransport ? checkins.filter(onlyNonTransportation) : checkins)
    const grouped = groupedTimeline(timeline)
    const filteredGrouped = selectedCountryCode ? grouped.filter(location => location.cc.toLowerCase() === selectedCountryCode.toLowerCase()) : grouped

    console.log('grouped', grouped)

    return (
        <Page header="Timeline">
            <AllFlags countries={grouped} selectedCountryCode={selectedCountryCode}/>
            <OptionsGroup>
                <ToggleButton checked={filterTransport} onClick={toggleFilterTransport}>Filter out transport</ToggleButton>
            </OptionsGroup>
            {/* <CountryBar name="Philippines" code="ph" states={['asd', 'dsadsd', 'fghjoiuhj']}/> */}
            {filteredGrouped.map(location => <Country location={location} />)}
            {/* {timeline.length && <CurrentlyInEvent event={timeline[0]}/>} */}
            {/* {timeline.map(event => <TimelineEvent event={event} />)} */}
        </Page>
    )
}
