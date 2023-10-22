import Button from 'components/Button'
import InfoPanel from '../../components/InfoPanel'
import SquareImage from '../../components/SquareImage'
import { useNavigate } from 'react-router'
import { useHideSwarmPanelSetting } from 'domain/settings'
import { styled } from 'goober'
import Separator from 'components/Separator'
import { VscChromeClose } from 'react-icons/vsc'
import { SlSettings } from 'react-icons/sl'

const Buttons = styled('div')`
    display: flex;
    align-self: stretch;
    flex-direction: row;
    align-items: space-between;
`

const COPY = `You can connect your Swarm account in settings to enhance your timeline.

`
export default function SwarmSetupPanel() {
    const navigate = useNavigate()
    const [hideSwarmPanel, setHideSwarmPanel] = useHideSwarmPanelSetting()

    const onOpenSettings = () => navigate('/settings')
    const onNotInterested = () => setHideSwarmPanel(true)

    if (hideSwarmPanel) return null

    return (
        <InfoPanel 
            header="Do you use Swarm?"
            spacing
            image={<SquareImage size={100} src="/3d/beegarden1.png"/>}
        >
            {COPY}
            <Buttons>
                <Button icon={SlSettings} onClick={onOpenSettings}>Set up in settings</Button>
                <Separator />
                <Button icon={VscChromeClose} onClick={onNotInterested}>Not interested</Button>
            </Buttons>
        </InfoPanel>
    )
}
