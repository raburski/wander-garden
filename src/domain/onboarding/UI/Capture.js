import Panel from 'components/Panel'
import Page from './Page'
import Stays from 'routes/Extension/Stays'

const COPY_1 = `Select one of the providers below. Wander Garden will open website in the new tab and start automated processing.

`

const COPY_2 = `
Make sure to AUTHENTICATE on the providers website.

DO NOT INTERFERE by clicking, closing or typing anything while the process is in progress.
`

export default function Capture() {
    return (
        <Page header="Capture your first stays!" right="3 / 4">
            <Panel spacing>
            {COPY_1}
            <b>Extension will take over your browser while its capturing data.</b>
            {COPY_2}
            </Panel>
            <Stays />
        </Page>
    )
}