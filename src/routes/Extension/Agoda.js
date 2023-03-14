import { styled } from 'goober'
import InfoPanel from "components/InfoPanel"
import Button from '../../components/Button'
import { FiExternalLink } from 'react-icons/fi'
import { useCaptureAgoda } from 'domain/extension'

const Logo = styled('img')`
    width: 42px;
    height: 42px;
`

const COPY = `Extension will open new browser tab. It will fetch all your trips and close the tab. You may need to authenticate during the process.

`

export default function Agoda() {
    const captureAgode = useCaptureAgoda()
    return (
        <InfoPanel title="Agoda" spacing image={<Logo src="/logo/agoda.svg"/>}>
            {COPY}
            <Button icon={FiExternalLink} onClick={captureAgode}>Open and capture Agoda</Button>
        </InfoPanel>
    )
}