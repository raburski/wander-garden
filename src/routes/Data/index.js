import { useState } from "react"
import { SiSwarm } from 'react-icons/si'
import { TbBrandBooking } from 'react-icons/tb'
import moment from 'moment'
import Page from 'components/Page'
import Panel from '../../components/Panel'
import { formattedLocation } from 'domain/location'
import { useCheckins } from 'domain/swarm'
import { useStays } from 'domain/stays'
import Segment from 'components/Segment'
import NoneFound from 'components/NoneFound'
import InfoRow from 'components/InfoRow'

function CheckinRow({ checkin }) {
    const subtitle = `in ${formattedLocation(checkin.venue.location)}`
    return <InfoRow icon={SiSwarm} title={checkin.venue.name} subtitle={subtitle} right={moment(checkin.date).format('DD/MM/YYYY')}/>
}

function StayRow({ stay }) {
    const subtitle = `in ${formattedLocation(stay.location)}`
    const dateRange = `${moment(stay.since).format('DD/MM/YYYY')} - ${moment(stay.until).format('DD/MM/YYYY')}`
    return <InfoRow icon={TbBrandBooking} title={stay.hotel.name} subtitle={subtitle} right={dateRange}/>
}

function SwarmCheckinsList() {
    const [checkins] = useCheckins()
    return checkins ? checkins.map(checkin => <CheckinRow checkin={checkin} key={checkin.id} />) : <NoneFound />
}

function BookingComList() {
    const [stays] = useStays()
    return stays ? stays.map(stay => <StayRow stay={stay} key={stay.id} />) : <NoneFound />
}

export default function Data() {
    const [selectedIndex, setSelectedIndex] = useState(0)
    const titles = ['Swarm', 'Booking.com']
    return (
        <Page header="Data">
            <Segment titles={titles} selectedIndex={selectedIndex} onClick={setSelectedIndex}/>
            <Panel style={{maxHeight: '84%', marginTop: 22}} contentStyle={{ overflow: 'scroll' }}>
                {selectedIndex === 0 ? <SwarmCheckinsList /> : null}
                {selectedIndex === 1 ? <BookingComList /> : null}
            </Panel>
        </Page>
    )
}