import { useTimelineGroup } from 'domain/timeline'
import { titleFromLocationHighlights } from 'domain/timeline/groups'
import { useParams } from 'react-router'
import Page from '../../components/Page'
import Panel, { Row } from '../../components/Panel'
import GroupEvent from 'routes/Timeline/GroupEvent'
import { styled } from 'goober'
import { useStays } from 'domain/stays'
import moment from 'moment'
import useTrip from './useTrip'
import GroupBar from 'routes/Timeline/GroupBar'
import { getDaysAndRangeText } from 'date'
import useGroups, { GroupType } from './useGroups'
import Phase from './Phase'

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

function Group({ group }) {
    const [days] = getDaysAndRangeText(group.since, group.until)
    // TODO: support unknown type
    // if (group.type === GroupType.Unknown) {
    //     return null
    // }
    return (
        <GroupContainer>
            <GroupHeader countryCodes={[group?.location?.cc]} title={getGroupTitle(group)} days={days}/>
            {group.phases.map(phase => <Phase phase={phase} />)}
        </GroupContainer>
    )
}


function GroupsPanel({ groups }) {
    return (
        <Panel>
            {groups.map(group => <Group group={group}/>)}
        </Panel>
    )
}


export default function Trip() {
    const { id } = useParams()
    const group = useTimelineGroup(id)

    const trip = useTrip(group?.since, group?.until)
    const groups = useGroups(group?.since, group?.until)

    if (!group) { return null }

    console.log('groups', groups)

    const header = `Trip to ${titleFromLocationHighlights(group.highlights)}`
    const leftToRightPhases = [...group.phases].reverse()

    console.log('trip', trip)

    return (
        <Page header={header} showBackButton>
            <Panel header={`${moment(group?.since).format('DD/MM/YYYY')} - ${moment(group?.until).format('DD/MM/YYYY')}`}>
                <EventsContainer>{leftToRightPhases.map(event => <GroupEvent key={event.id} event={event}/>)}</EventsContainer>
            </Panel>
            <GroupsPanel groups={groups} />
        </Page>
    )
}