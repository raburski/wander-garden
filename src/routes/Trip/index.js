import { useTimelineGroup } from 'domain/timeline'
import { titleFromLocationHighlights } from 'domain/timeline/groups'
import { useParams } from 'react-router'
import Page from '../../components/Page'
import Panel from '../../components/Panel'
import { styled } from 'goober'
import moment from 'moment'
import GroupBar from 'routes/Timeline/GroupBar'
import { getDaysAndRangeText } from 'date'
import useGroups, { GroupType } from './useGroups'
import Phase from './Phase'
import { useRef, useState } from 'react';
import Separator from 'components/Separator';
import { Column, Row } from 'components/container';
import Map, { Icon } from 'domain/map'
import { detectStayType } from 'domain/stays'
import Info from './Info'
import { venueEmoji } from 'domain/swarm/categories'
import TripMap from './Map'
import CustomStayModal from 'domain/stays/CustomStayModal'
import { LocationAccuracy } from 'domain/location'
import { useTrip } from 'domain/trips'

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

function Group({ group, onPhaseHighlight, onPhaseClick, onGroupClick }) {
    const [days] = getDaysAndRangeText(group.since, group.until)
    return (
        <GroupContainer>
            {group.type !== GroupType.Unknown ? <GroupHeader countryCodes={[group?.location?.cc]} title={getGroupTitle(group)} days={days} onClick={onGroupClick}/> : null}
            {group.phases.map(phase => 
                <Phase
                    phase={phase}
                    onMouseEnter={() => onPhaseHighlight(phase)}
                    onClick={() => onPhaseClick(phase)}
                />
            )}
        </GroupContainer>
    )
}


function GroupsPanel({ groups, onPhaseHighlight, onPhaseClick, onGroupClick, ...props }) {
    return (
        <Panel flex {...props}>
            {groups.map(group => <Group group={group} onPhaseHighlight={onPhaseHighlight} onPhaseClick={onPhaseClick} onGroupClick={() => onGroupClick(group)}/>)}
        </Panel>
    )
}

export default function Trip() {
    const { id } = useParams()
    const [highlightedPhase, setHighlightedPhase] = useState()
    const [customStayModal, setCustomStayModal] = useState()
    const trip = useTrip(id)
    const groups = useGroups(trip)
    const mapRef = useRef()

    if (!trip) { return null }

    const checkins = trip.phases.flatMap(phase => phase.checkins)

    const header = `Trip to ${titleFromLocationHighlights(trip.highlights)}`
    const leftToRightPhases = [...trip.phases].reverse()

    const onPhaseClick = (phase) => {
        if (!phase.stay) {
            const phaseIndex = trip.phases.findIndex(p => p.since === phase.since)
            const previousPhase = phaseIndex > 0 ? trip.phases[phaseIndex - 1] : undefined
            setCustomStayModal({
                phase,
                previousPhase,
            })
        } else if (phase.stay) {
            const location = phase.stay.location
            if (!location.accuracy || location.accuracy === LocationAccuracy.GPS) {
                const map = mapRef.current.getMap()
                const ZOOM_TO = 13
                if (map.getZoom() === ZOOM_TO) {
                    map.panTo(location)
                } else {
                    map.panTo(location)
                    map.setZoom(ZOOM_TO, true)
                }
            }
        }
    }

    const onGroupClick = (group) => {
        const map = mapRef.current
        if (group.type === GroupType.Country || group.type === GroupType.City) {
            map.fitBoundsToPositions(group.phases.map(phase => phase.stay.location))
        }
    }

    const closeCustomStayModal = () => setCustomStayModal(undefined)

    return (
        <Page header={header} showBackButton>
            <Row style={{flex:1, height: '86vh', alignItems: 'stretch', marginTop: -18}}>
                <Column style={{flex:0.7, overflowY: 'scroll', overflowX: 'hidden', minWidth: 400}}>
                    <Info style={{paddingTop: 18}} trip={trip} />
                    <GroupsPanel
                        groups={groups}
                        onPhaseHighlight={setHighlightedPhase}
                        onPhaseClick={onPhaseClick}
                        onGroupClick={onGroupClick}
                    />
                </Column>
                <Separator />
                <TripMap style={{paddingTop: 18}} mapRef={mapRef} trip={trip} checkins={checkins} highlightedPhase={highlightedPhase} />
            </Row>
            <CustomStayModal {...customStayModal} onClickAway={closeCustomStayModal}/>
        </Page>
    )
}