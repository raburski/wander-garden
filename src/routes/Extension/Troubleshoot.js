import { styled } from 'goober'
import InfoPanel from "components/InfoPanel"
import { VscWarning } from 'react-icons/vsc'
import WebStoreButton from './WebStoreButton'

const Icon = styled(VscWarning)`
    font-size: 32px;
    padding: 6px;
    padding-right: 0px;

`

const COPY = `We have detected some issues connecting to the extension. It is still a maturing technology that browsers can't handle consistently.

Please try removing the extension and installing it again from the web store.
Your data will not be lost. It is stored in the browser itself, not in the extension.

`

export default function ExtensionVersionNotMatching() {
    return (
        <InfoPanel spacing image={<Icon />}>
            {COPY}
            <WebStoreButton />
        </InfoPanel>
    )
}