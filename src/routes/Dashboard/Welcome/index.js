import WhatIsWanderGarden from '../../WebsiteInfo/WhatIsWanderGarden'
import Extension from './Extension'
import Swarm from './Swarm'
import { Column, Row } from 'components/container'

export default function WelcomeDashboard() {
    return (
        <Column>
            <WhatIsWanderGarden/>
            <Row>
                <Swarm/>
                <Extension/>
            </Row>
        </Column>
    )
}