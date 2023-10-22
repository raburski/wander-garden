import WhatIsWanderGarden from '../../About/WhatIsWanderGarden'
import Extension from './Extension'
import Swarm from './Swarm'
import SupprtedThridParties from './SupprtedThridParties'
import { Column, Row } from 'components/container'
import Separator from 'components/Separator'
import { useOnboardingFinishedSetting } from 'domain/settings'
import Button from 'components/Button'
import { useAllStays } from 'domain/stays'
import { IoIosRocket } from 'react-icons/io'

export default function WelcomeDashboard() {
    const [_, setOnboardingFinished] = useOnboardingFinishedSetting()
    const onStartOnboarding = () => setOnboardingFinished(false)

    // TODO: add some "is data" hook?
    const allStays = useAllStays()
    return (
        <Column>
            <WhatIsWanderGarden>
                {allStays.length === 0 ? <Button onClick={onStartOnboarding} icon={IoIosRocket}>Start onboarding!</Button> : null}
            </WhatIsWanderGarden>
            <SupprtedThridParties />
            <Row>
                <Swarm/>
                <Separator />
                <Extension/>
            </Row>
        </Column>
    )
}