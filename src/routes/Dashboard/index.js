import { useCheckIns, useCheckinsLastUpdated, useIsAuthenticated, _movies, _videos } from '../../swarm/singletons'
import { styled } from 'goober'
import { VscCheck } from "react-icons/vsc";
import Button from '../../components/Button'
import Page from '../../components/Page'
import CountryRow from '../../components/CountryRow'
import Panel, { Row } from '../../components/Panel'
import InfoPanel from '../../components/InfoPanel'
import Badges from './Badges'
import SquareImage from '../../components/SquareImage'
import AuthenticateButton from '../../bindings/swarm/AuthenticateButton'
import FetchCheckinsButton from '../../bindings/swarm/FetchCheckinsButton'
import moment from 'moment'

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
    const header = `You have visited ${countryCodes.length} countries`
    return (
        <Panel header={header}>
            {countryCodes.length == 0 ? <NoData /> : countryCodes.map(cc => <CountryRow code={cc} to={`/timeline?cc=${cc.toLowerCase()}`}/>)}
        </Panel>
    )
}

function SwarmAuthenticatePanel() {
    return (
        <InfoPanel 
            header="Swarm"
            spacing
            title="Connect your account"
            image={<SquareImage src="/3d/swarmcloud.png"/>}
        >
            <AuthenticateButton />
        </InfoPanel>
    )
}

function SwarmUpdateRequiredPanel() {
    return (
        <InfoPanel 
            header="Swarm"
            spacing
            title="Checkins list may be outdated..."
            image={<SquareImage src="/3d/swarmcloud.png"/>}
        >
            <FetchCheckinsButton />
        </InfoPanel>
    )
}

function SwarmDefaultPanel({ lastUpdated }) {
    const daysAgo = lastUpdated.diff(moment(), 'days')
    const text = daysAgo < 2 ? 'Recently updated...' : `Last updated ${daysAgo} days ago...`

    return <InfoPanel 
        header="Swarm"
        spacing
        text={text}
        image={<VscCheck size={22}/>}
    />
}

function Swarm() {
    const isAuthenticated = useIsAuthenticated()
    const lastUpdated = useCheckinsLastUpdated()
    if (!isAuthenticated) {
        return <SwarmAuthenticatePanel />
    }

    const shouldUpdate = !lastUpdated || lastUpdated.diff(moment(), 'days') > 7
    if (shouldUpdate) {
        return <SwarmUpdateRequiredPanel />
    }

    return <SwarmDefaultPanel lastUpdated={lastUpdated}/>
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

export default function Netflix() {
    return (
        <Page header="Dashboard">
            <PanelsContainer>
                <PanelColumn>
                    <Current />
                    <Swarm />
                    <Badges />
                </PanelColumn>
                <Countries />
            </PanelsContainer>
        </Page>
    )
}