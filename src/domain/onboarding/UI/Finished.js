import Button from "components/Button";
import Page from "./Page";

export default function Finished({ onNext }) {
    return (
        <Page header="Wander Garden" right="4 / 4">
                <Button onClick={onNext}>Finished!</Button>
        </Page>
    )
}