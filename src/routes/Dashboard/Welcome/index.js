import WhatIsWanderGarden from '../../About/WhatIsWanderGarden'
import Extension from './Extension'
import Swarm from './Swarm'
import SupprtedThridParties from './SupprtedThridParties'
import { Column, Row } from 'components/container'
import Separator from 'components/Separator'

export default function WelcomeDashboard() {
    return (
        <Column>
            <WhatIsWanderGarden/>
            <SupprtedThridParties />
            <Row>
                <Swarm/>
                <Separator />
                <Extension/>
            </Row>
        </Column>
    )
}