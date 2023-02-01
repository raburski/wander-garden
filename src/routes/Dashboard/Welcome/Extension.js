import { useNavigate } from "react-router-dom"
import InfoPanel from 'components/InfoPanel'
import SquareImage from 'components/SquareImage'
import Button from 'components/Button'
import { SlPuzzle } from 'react-icons/sl'

const COPY = `Install browser extension and capture travel data from 3rd party websites.

`

export default function ExtensionPanel() {
    const navigate = useNavigate()
    const onGoToExtension = () => navigate('/extension')
    return (
        <InfoPanel 
            header="Extension"
            spacing
            flex
            image={<SquareImage src="/3d/puzzle.png"/>}
        >
            {COPY}
            <Button icon={SlPuzzle} onClick={onGoToExtension}>Go to extension</Button>
        </InfoPanel>
    )
}
