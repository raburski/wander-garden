import InfoPanel from "components/InfoPanel"
import PanelWarningIcon from 'components/PanelWarningIcon'
import WebStoreButton from './WebStoreButton'

const COPY = `Version mismatch or communication failure detected between website and extension. Please reload this website and make sure you have latest extension installed.

`

export default function ExtensionVersionNotMatching() {
    return (
        <InfoPanel spacing image={<PanelWarningIcon />}>
            {COPY}
            <WebStoreButton />
        </InfoPanel>
    )
}