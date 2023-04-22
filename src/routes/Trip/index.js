import { useTimelineGroup } from 'domain/timeline'
import { titleFromLocationHighlights } from 'domain/timeline/groups'
import { useParams } from 'react-router'
import Page from '../../components/Page'
import Panel from '../../components/Panel'
import GroupEvent from 'routes/Timeline/GroupEvent'
import { styled } from 'goober'
import moment from 'moment'
import useTrip, { PhaseType, StayPhase } from './useTrip'
import GroupBar from 'routes/Timeline/GroupBar'
import { getDaysAndRangeText } from 'date'
import useGroups, { GroupType } from './useGroups'
import Phase from './Phase'
import { useState } from 'react';
import Separator from 'components/Separator';
import { Column, Row } from 'components/container';
import Map from 'components/Map'

const EventsContainer = styled('div')`
    display: flex;
    padding: 12px;
    flex-wrap: wrap;
    align-items: center;
`

const GroupContainer = styled('div')`
    border-bottom: 0px solid ${props => props.theme.border};
    border-top: 1px solid ${props => props.theme.border};
    margin-top: -1px;
    padding-bottom: 10px;
`

const GroupHeader = styled(GroupBar)`
    border: 0px solid;
`

function getPhaseTitle(phase) {
    return phase?.stay?.accomodation?.name
}

function getGroupTitle(group) {
    switch (group.type) {
        case GroupType.City:
            return group?.location?.city
        case GroupType.Country:
            return group?.location?.country
        case GroupType.Unknown:
            return group?.guessedLocations?.map(l => l.city).join(' or ')
        default:
            return undefined
    }
}

function Group({ group, onPhaseHighlight }) {
    const [days] = getDaysAndRangeText(group.since, group.until)
    // TODO: support unknown type
    // if (group.type === GroupType.Unknown) {
    //     return null
    // }
    return (
        <GroupContainer>
            <GroupHeader countryCodes={[group?.location?.cc]} title={getGroupTitle(group)} days={days}/>
            {group.phases.map(phase => <Phase phase={phase} onMouseEnter={() => onPhaseHighlight(phase)}/>)}
        </GroupContainer>
    )
}


function GroupsPanel({ groups, onPhaseHighlight, ...props }) {
    return (
        <Panel flex {...props}>
            {groups.map(group => <Group group={group} onPhaseHighlight={onPhaseHighlight}/>)}
        </Panel>
    )
}

function TripMap({ trip, style = {}, highlightedPhase }) {
    const stays = trip ? trip.phases.map(phase => phase.type === PhaseType.Stay ? phase.stay : undefined).filter(Boolean) : []
    const markers = stays.map(stay => ({ position: stay.location }))
    const highlightedStayIndex = highlightedPhase ? stays.findIndex(stay => highlightedPhase.stay === stay) : undefined

    return (
        <Panel style={{flex: 1, alignSelf: 'stretch', flexShrink: 2, ...style }} contentStyle={{ flex: 1, display: 'flexbox', alignSelf: 'stretch'}}>
            <Map markers={markers} bouncingMarkerIndex={highlightedStayIndex}/>
        </Panel>
    )
}


export default function Trip() {
    const { id } = useParams()
    const [highlightedPhase, setHighlightedPhase] = useState()
    const group = useTimelineGroup(id)

    const trip = useTrip(group?.since, group?.until)
    const groups = useGroups(group?.since, group?.until)

    if (!group) { return null }

    const header = `Trip to ${titleFromLocationHighlights(group.highlights)}`
    const leftToRightPhases = [...group.phases].reverse()

    return (
        <Page header={header} showBackButton>
            
            <Row style={{flex:1, height: '86vh', alignItems: 'stretch', marginTop: -18}}>
                <Column style={{flex:0.7, overflowY: 'scroll', overflowX: 'hidden', minWidth: 400}}>
                    <Panel style={{paddingTop: 18}}>
                        <EventsContainer>{leftToRightPhases.map(event => <GroupEvent key={event.id} event={event}/>)}</EventsContainer>
                    </Panel>
                    <GroupsPanel header={`${moment(group?.since).format('DD/MM/YYYY')} - ${moment(group?.until).format('DD/MM/YYYY')}`} groups={groups} onPhaseHighlight={setHighlightedPhase}/>
                </Column>
                <Separator />
                <TripMap style={{paddingTop: 18}} trip={trip} highlightedPhase={highlightedPhase}/>
            </Row>
        </Page>
    )
}