import { useCheckins, useIsAuthenticated } from '../../domain/swarm'
import { styled } from 'goober'
import Page from '../../components/Page'
import CountryRow from '../../components/CountryRow'
import Panel from '../../components/Panel'
import Badges from './Badges'
import Welcome from './Welcome'
import Swarm from './Swarm'
import { Column, Row } from 'components/container'

import countryFlagEmoji from "country-flag-emoji"
import { formattedLocation } from 'domain/location'
import { useVisitedCountryCodes } from 'domain/timeline'
import ThemeChange from './ThemeChange'

const Text = styled('p')`
    display: flex;
    margin: 0px;
    padding: 8px;
    padding-left: 14px;
    margin-bottom: 2px;
    font-size: 14px;
    color: ${props => props.theme.text}
`

function NoData() {
    return <Text>No data available...</Text>
}

function Countries() {
    const [countryCodes] = useVisitedCountryCodes()
    if (countryCodes.length <= 0) {
        return null
    }
    const header = `You have visited ${countryCodes.length} countries`
    return (
        <Panel header={header} margin>
            {countryCodes.length == 0 ? <NoData /> : countryCodes.map(cc => <CountryRow code={cc} key={cc} to={`/timeline?cc=${cc.toLowerCase()}`}/>)}
        </Panel>
    )
}

const BigFlag = styled('div')`
    display: flex;
    font-size: 32px;
    margin-right: 12px;
`

const CurrentContent = styled('div')`
    display: flex;
    margin: 4px;
    flex-direction: row;
    align-items: center;
    padding-right: 12px;
    padding-left: 8px;
    color: ${props => props.theme.text};
`

function Current() {
    const [checkins] = useCheckins()
    const latestCheckin = checkins[0]
    const currentCountry = latestCheckin ? countryFlagEmoji.get(latestCheckin.venue.location.cc) : null
    if (!currentCountry) { return null }
    
    const header = `Currently staying in ${currentCountry.name}`
    return (
        <Panel header={header} margin>
            <CurrentContent><BigFlag>{currentCountry.emoji}</BigFlag> {formattedLocation(latestCheckin.venue.location)}</CurrentContent>
        </Panel>
    )
}

function AuthenticatedDashboard() {
    const isAuthenticated = useIsAuthenticated()
    return (
        <Row>
            <Column>
                <Current />
                {isAuthenticated ? <Swarm /> : null}
                <Badges />
            </Column>
            <Countries />
        </Row>
    )
}


export default function Dashboard() {
    const [countries] = useVisitedCountryCodes()
    return (
        <Page header="Dashboard" right={<ThemeChange />}>
            {countries.length ? <AuthenticatedDashboard /> : <Welcome />}
        </Page>
    )
}