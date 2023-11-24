import { useCheckins, useIsAuthenticated, useShowUpdateModal } from '../../domain/swarm'
import { styled } from 'goober'
import Page from '../../components/Page'
import CountryRow from '../../components/CountryRow'
import Panel from '../../components/Panel'
import Badges from './Badges'
import Welcome from './Welcome'
import { Column, Row } from 'components/container'
import PinButton from "components/PinButton"

import countryFlagEmoji from "country-flag-emoji"
import { formattedLocation } from 'domain/location'
import { useVisitedCountryCodes } from 'domain/visitedCountries'
import Separator from 'components/Separator'
import { TbRefresh } from 'react-icons/tb'
import SwarmSetupPanel from './SwarmSetupPanel'
import Stats from './Stats'


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

const Divider = styled('div')`
    display: flex;
    flex: 1;
`

const COPY_LOAD_CHECKINS = 'Fetch your first checkins...'
function Current() {
    const [checkins] = useCheckins()
    const showUpdateModal = useShowUpdateModal()
    const latestCheckin = checkins[0]
    const currentCountry = latestCheckin ? countryFlagEmoji.get(latestCheckin.venue.location.cc) : null
    
    const header = currentCountry ? `Currently staying in ${currentCountry.name}` : 'Where are you now?'
    return (
        <Panel header={header}>
            <CurrentContent>
                <BigFlag>{currentCountry ? currentCountry.emoji : '🏳️'}</BigFlag>
                {latestCheckin ? formattedLocation(latestCheckin.venue.location) : COPY_LOAD_CHECKINS}
                <Divider />
                <PinButton onClick={showUpdateModal} tooltip="Update checkins" tooltipPosition="left" tooltipOffset={112} icon={TbRefresh}/>
            </CurrentContent>
        </Panel>
    )
}

function AuthenticatedDashboard() {
    const isAuthenticated = useIsAuthenticated()
    return (
        <Row>
            <Column style={{flex: 1}}>
                {isAuthenticated ? <Current /> : <SwarmSetupPanel />}
                <Stats />
            </Column>
            <Separator />
            <Column style={{flex: 1}}>
                <Badges />
                
            </Column>
        </Row>
    )
}


export default function Dashboard() {
    const countries = useVisitedCountryCodes()
    return (
        <Page header="Dashboard">
            {countries.length ? <AuthenticatedDashboard /> : <Welcome />}
        </Page>
    )
}