import { useCheckIns, _movies, _videos } from '../../swarm/singletons'
import { styled } from 'goober'
import Button from '../../components/Button'
import Page from '../../components/Page'
import Panel, { Row } from '../../components/Panel'
import Badges from './Badges'

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

const FlagIcon = styled('div')`
    display: flex;
    flex: 0;
    align-self: start;
`

const CountryName = styled('div')`
    font-size: 14px;
    margin-left: 8px;
    margin-top: -1px;
`

function Country({ country }) {
    const to = `/timeline?cc=${country.code.toLowerCase()}`
    return <Row to={to}><FlagIcon>{country.emoji}</FlagIcon> <CountryName>{country.name}</CountryName></Row>
}

function NoData() {
    return <Text>No data available...</Text>
}

function Countries() {
    const checkins = useCheckIns()
    const countryCodes = checkins.filter(onlyNonTransportation).map(checkin => checkin.venue.location.cc).filter(onlyUnique)
    const title = `You have visited ${countryCodes.length} countries`
    return (
        <Panel title={title}>
            {countryCodes.length == 0 ? <NoData /> : countryCodes.map(cc => <Country country={countryFlagEmoji.get(cc)}/>)}
        </Panel>
    )
}

function Swarm() {
    return (
        <Panel title="Swarm" spacing>
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
    const currentCountry = countryFlagEmoji.get(latestCheckin.venue.location.cc)
    const title = `Currently staying in ${currentCountry.name}`
    return (
        <Panel title={title}>
            <CurrentContent><BigFlag>{currentCountry.emoji}</BigFlag> {formattedLocation(latestCheckin.venue.location)}</CurrentContent>
        </Panel>
    )
}

export default function Netflix() {
    return (
        <Page title="Dashboard">
            <PanelsContainer>
                <PanelColumn>
                    <Current />
                    <Badges />
                    <Swarm />
                </PanelColumn>
                <Countries />
            </PanelsContainer>
        </Page>
    )
}