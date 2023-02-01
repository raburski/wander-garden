import { useNavigate } from "react-router-dom"
import Button from 'components/Button'
import InfoPanel from 'components/InfoPanel'
import SquareImage from 'components/SquareImage'
import { SiSwarm } from 'react-icons/si'

const COPY = `Authenticate with Swarm and import all your checkins into the garden.

`

export default function Swarm() {
    const navigate = useNavigate()
    const onGoToSwarm = () => navigate('/swarm')
    return (
        <InfoPanel 
            header="Swarm"
            spacing
            margin
            flex
            image={<SquareImage src="/3d/beegarden1.png"/>}
            containerStyle={{alignItems: 'center'}}
        >
            {COPY}
            <Button icon={SiSwarm} onClick={onGoToSwarm}>Go to Swarm</Button>
        </InfoPanel>
    )
}