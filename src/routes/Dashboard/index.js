import { useCheckIns, useIsAuthenticated, _movies, _videos } from '../../swarm/singletons'
import { styled } from 'goober'
import Page from '../../components/Page'
import CountryRow from '../../components/CountryRow'
import Panel from '../../components/Panel'
import Badges from './Badges'
import Swarm from './Swarm'

import countryFlagEmoji from "country-flag-emoji"
import { onlyUnique } from "../../array"
import { onlyNonTransportation } from '../../swarm/categories'
import { formattedLocation } from '../../location'

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
    const checkins = useCheckIns()
    const countryCodes = checkins.filter(onlyNonTransportation).map(checkin => checkin.venue.location.cc).filter(onlyUnique)
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
    const checkins = useCheckIns()
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

function WhatIsWanderGarden() {
    return null
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
            <PanelColumn>
                <Swarm />
            </PanelColumn>
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