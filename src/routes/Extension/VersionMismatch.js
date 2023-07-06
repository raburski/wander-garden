import InfoPanel from "components/InfoPanel"
import PanelWarningIcon from 'components/PanelWarningIcon'
import WebStoreButton from './WebStoreButton'
import { CURRENT_VERSION } from "domain/stays"

const COPY = `Version mismatch or communication failure detected between website and extension. Please reload this website and make sure you have latest extension installed.

Latest version: ${CURRENT_VERSION}

`

export default function ExtensionVersionNotMatching() {
    return (
        <InfoPanel spacing image={<PanelWarningIcon />} title="Browser extension">
            {COPY}
            <WebStoreButton />
        </InfoPanel>
    )
}