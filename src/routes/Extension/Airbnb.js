import { styled } from 'goober'
import InfoPanel from "components/InfoPanel"
import Button from '../../components/Button'
import { FiExternalLink } from 'react-icons/fi'
import { useCaptureAirbnb } from 'domain/extension'

const Logo = styled('img')`
    width: 42px;
    height: 42px;
`

const COPY = `Extension will open new browser tab. It will fetch all your trips and close the tab. You may need to authenticate during the process.

`

export default function Airbnb() {
    const captureAirbnb = useCaptureAirbnb()
    return (
        <InfoPanel title="Airbnb" spacing image={<Logo src="/logo/airbnb.svg"/>} containerStyle={{whiteSpace: 'pre-wrap'}}>
            {COPY}
            <Button icon={FiExternalLink} onClick={captureAirbnb}>Open and capture Airbnb</Button>
        </InfoPanel>
    )
}