import { styled } from 'goober'
import InfoPanel from "components/InfoPanel"
import { VscWarning } from 'react-icons/vsc'
import WebStoreButton from './WebStoreButton'

const Icon = styled(VscWarning)`
    font-size: 32px;
    padding: 6px;
    padding-right: 0px;
`

const COPY = `Version mismatch or communication failure detected between website and extension. Please reload this website and make sure you have latest extension installed.

`

export default function ExtensionVersionNotMatching() {
    return (
        <InfoPanel spacing image={<Icon />}>
            {COPY}
            <WebStoreButton />
        </InfoPanel>
    )
}