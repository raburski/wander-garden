import { useCheckins, useIsAuthenticated } from '../../domain/swarm'
import { styled } from 'goober'
import Page from '../../components/Page'
import CountryRow from '../../components/CountryRow'
import Panel from '../../components/Panel'
import WhatIsWanderGarden from '../WebsiteInfo/WhatIsWanderGarden'
import Badges from './Badges'
import Swarm from './Swarm'

import countryFlagEmoji from "country-flag-emoji"
import { formattedLocation } from 'domain/location'
import { useVisitedCountryCodes } from 'domain/timeline'

const PanelsContainer = styled('div')`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
`

const PanelColumn = styled('div')`
    display: flex;
    flex-direction: column;
`

const Text = styled('p')`
    display: flex;
    margin: 0px;
    padding: 8px;
    padding-left: 14px;
    margin-bottom: 2px;
    font-size: 14px;
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
        <Panel header={header}>
            {countryCodes.length == 0 ? <NoData /> : countryCodes.map(cc => <CountryRow code={cc} to={`/timeline?cc=${cc.toLowerCase()}`}/>)}
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
`

function Current() {
    const [checkins] = useCheckins()
    const latestCheckin = checkins[0]
    const currentCountry = latestCheckin ? countryFlagEmoji.get(latestCheckin.venue.location.cc) : null
    if (!currentCountry) { return null }
    
    const header = `Currently staying in ${currentCountry.name}`
    return (
        <Panel header={header}>
            <CurrentContent><BigFlag>{currentCountry.emoji}</BigFlag> {formattedLocation(latestCheckin.venue.location)}</CurrentContent>
        </Panel>
    )
}

function AuthenticatedDashboard() {
    return (
        <PanelsContainer>
            <PanelColumn>
                <Current />
                <Swarm />
                <Badges />
            </PanelColumn>
            <Countries />
        </PanelsContainer>
    )
}

function DefaultDashboard() {
    return (
        <PanelsContainer>
            <WhatIsWanderGarden />
            <Swarm />
        </PanelsContainer>
    )
}

export default function Dashboard() {
    const isAuthenticated = useIsAuthenticated()
    return (
        <Page header="Dashboard">
            {isAuthenticated ? <AuthenticatedDashboard /> : <DefaultDashboard />}
        </Page>
    )
}