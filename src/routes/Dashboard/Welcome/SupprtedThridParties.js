import { useNavigate } from "react-router-dom"
import Panel from 'components/Panel'
import SquareImage from 'components/SquareImage'
import Button from 'components/Button'
import { SlPuzzle } from 'react-icons/sl'
import { Column, Row } from 'components/container'
import Separator from "components/Separator"

export default function ExtensionPanel() {
    const navigate = useNavigate()
    const onGoToExtension = () => navigate('/extension')
    return (
        <Panel 
            header="Supports"
            spacing
            flex
        >
            <Row>
                <SquareImage size={64} src="/logo/swarm.svg"/>
                <Separator />
                <SquareImage size={64} src="/logo/agoda.svg"/>
                <Separator />
                <SquareImage size={64} src="/logo/bookingcom.svg"/>
                <Separator />
                <SquareImage size={64} src="/logo/airbnb.svg"/>
            </Row>
        </Panel>
    )
}
