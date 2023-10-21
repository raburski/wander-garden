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
import { useVisitedCountryCodes } from 'domain/timeline'
import Separator from 'components/Separator'
import CountryModal from 'bindings/CountryModal'
import { useState } from 'react'
import { TbRefresh } from 'react-icons/tb'

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
    const [openedCountry, setOpenedCountry] = useState()
    const onCountryClick = (cc) => setOpenedCountry(cc)
    const onClickAway = (cc) => setOpenedCountry(undefined)
    const [countryCodes] = useVisitedCountryCodes()

    if (countryCodes.length <= 0) {
        return null
    }
    const header = `You have visited ${countryCodes.length} countries`
    return (
        <Panel header={header}>
            {countryCodes.length == 0 ? <NoData /> : countryCodes.map(cc => <CountryRow code={cc} key={cc} onClick={() => onCountryClick(cc)} />)}
            <CountryModal countryCode={openedCountry} onClickAway={onClickAway}/>
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

const Divider = styled('div')`
    display: flex;
    flex: 1;
`

function Current() {
    const [checkins] = useCheckins()
    const showUpdateModal = useShowUpdateModal()
    const latestCheckin = checkins[0]
    const currentCountry = latestCheckin ? countryFlagEmoji.get(latestCheckin.venue.location.cc) : null
    if (!currentCountry) { return null }
    
    const header = `Currently staying in ${currentCountry.name}`
    return (
        <Panel header={header}>
            <CurrentContent>
                <BigFlag>{currentCountry.emoji}</BigFlag>
                {formattedLocation(latestCheckin.venue.location)}
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
                {isAuthenticated ? <Current /> : null}
                <Countries />
            </Column>
            <Separator />
            <Column style={{flex: 1}}>
                <Badges />
                
            </Column>
        </Row>
    )
}


export default function Dashboard() {
    const [countries] = useVisitedCountryCodes()
    return (
        <Page header="Dashboard">
            {countries.length ? <AuthenticatedDashboard /> : <Welcome />}
        </Page>
    )
}