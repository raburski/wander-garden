import Button from "components/Button";
import Page from "./Page";
import InfoPanel from "components/InfoPanel";
import SquareImage from "components/SquareImage";
import { VscDashboard } from "react-icons/vsc";

const COPY = `Your journey just started!
Now all you need is go and explore the world.
Come back from time to time to update your data :)

`

export default function Finished({ onNext }) {
    return (
        <Page header="You are set" right="4 / 4">
            <InfoPanel image={<SquareImage src="/3d/rocket.png" size={180}/>} spacing>
                {COPY}
                <Button onClick={onNext}>Take me to my dashboard!</Button>
            </InfoPanel>
        </Page>
    )
}