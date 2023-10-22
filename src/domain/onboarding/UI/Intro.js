import Button from "components/Button";
import Page from "./Page";
import { VscWand } from "react-icons/vsc";
import InfoPanel from "components/InfoPanel";
import SquareImage from "components/SquareImage";
import { ImLab } from "react-icons/im";
import Panel from "components/Panel";

const COPY = `Welcome traveller!

Before you start enjoying benefits of your safe and private travel garden we will need to get you set up.

All your data will be stored solely in your browser. There are no databases and backend servers for the garden.
`

const COPY_CAPTURE = `To get you started we will need to capture some of your travel stays. Two easy steps and you will be ready to go!

`

const COPY_DEMO = `Feel like looking around first? Check out garden with some example stays!

`

const contentStyle = {paddingTop: 12, paddingBottom: 12, padding:24, textAlign: 'center'}

export default function Into({ onNext, onDemo }) {
    return (
        <Page header="Wander Garden" right="1 / 4">
            <InfoPanel  contentStyle={contentStyle}>
                {COPY}
            </InfoPanel>
            <Panel contentStyle={contentStyle}>
                {COPY_CAPTURE}
                <Button style={{alignSelf: 'center'}} icon={VscWand} onClick={onNext}>Lets get those trips of mine!</Button>
            </Panel>
            <Panel contentStyle={contentStyle}>
                {COPY_DEMO}
                <Button style={{alignSelf: 'center'}} icon={ImLab} onClick={onDemo}>Show me the demo account!</Button>
            </Panel>
        </Page>
    )
}