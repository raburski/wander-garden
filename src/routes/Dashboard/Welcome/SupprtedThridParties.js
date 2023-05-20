import Panel from 'components/Panel'
import SquareImage from 'components/SquareImage'
import { Row } from 'components/container'
import Separator from "components/Separator"

const TRAVALA_STYLE = {borderRadius: 8}

export default function SupportedThirdParties() {
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
                <Separator />
                <SquareImage size={64} src="/logo/travala.svg" style={TRAVALA_STYLE}/>
            </Row>
        </Panel>
    )
}
