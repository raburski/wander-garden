import { useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import countryFlagEmoji from "country-flag-emoji"
import { styled } from 'goober'
import { onlyUnique } from "../../array"
import { useCheckins } from "../../swarm"
import { onlyNonTransportation, venueEmoji } from '../../swarm/categories'
import { hasCity, hasState, isEqualCity, isEqualCountry, isEqualState} from '../../location'
import { getCategory } from "../../swarm/categories"
import CountryBar from "./CountryBar"
import Page from "../../components/Page"
import ToggleButton from "../../components/ToggleButton"
import colors from "../../colors"
import Panel from "../../components/Panel"

import createTimelineEvents from './timeline'


const OptionsGroup = styled('div')`
    padding-top: 12px;
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

const AllFlagsContainer = styled('div')`
    display: flex;
    flex-direction: row;
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

function AllFlags({ countryCodes = [], selectedCountryCode }) {
    return <AllFlagsContainer>{countryCodes.map(cc => <FlagButton to={selectedCountryCode === cc.toLowerCase() ? `?` : `?cc=${cc.toLowerCase()}`} selected={selectedCountryCode == cc.toLowerCase()}>{countryFlagEmoji.get(cc).emoji}</FlagButton>)}</AllFlagsContainer>
}

export default function Timeline() {
    const [params] = useSearchParams()
    const selectedCountryCode = params.get('cc')?.toLowerCase()
    const [filterTransport, setFilterTransport] = useState(false)
    // const toggleFilterTransport = () => setFilterTransport(!filterTransport)

    const [checkins] = useCheckins()
    console.log(createTimelineEvents(checkins))
    const countryCodes = checkins.filter(onlyNonTransportation).map(checkin => checkin?.venue?.location?.cc).filter(onlyUnique)
    // const timeline = createTimeline(checkins)

    return (
        <Page header="Timeline">
            <Panel spacing>
                <AllFlags countryCodes={countryCodes} selectedCountryCode={selectedCountryCode}/>
                {/* <OptionsGroup>
                    <ToggleButton checked={filterTransport} onClick={toggleFilterTransport}>Filter out transport</ToggleButton>
                </OptionsGroup> */}
            </Panel>
        </Page>
    )
}
