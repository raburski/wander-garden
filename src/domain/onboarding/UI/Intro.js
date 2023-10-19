import Button from "components/Button";
import Page from "./Page";
import { VscWand } from "react-icons/vsc";
import InfoPanel from "components/InfoPanel";
import SquareImage from "components/SquareImage";

const COPY = `To get you started we will need to capture some of your travel stays.

Two easy steps and you are ready to go!

`

const contentStyle = {paddingTop: 12, paddingBottom: 12}

export default function Into({ onNext }) {
    return (
        <Page header="Wander Garden" right="1 / 4">
            <InfoPanel image={<SquareImage src="/3d/backpackgarden.png" size={180}/>} contentStyle={contentStyle}>
                {COPY}
                <Button style={{alignSelf: 'center'}} icon={VscWand} onClick={onNext}>Ok, what do I do?</Button>
            </InfoPanel>
        </Page>
    )
}