import Panel from "components/Panel"
import { useIsAuthenticated, useLogout } from "domain/swarm"
import { IoLogoInstagram } from "react-icons/io"
import AuthenticateButton from "bindings/instagram/AuthenticateButton"
import Button from "components/Button"
import Separator from "components/Separator"

const ACCOUNT_COPY_AUTHED = `You can disconnect your instagram account anytime. You will no longer be able to fetch photos, but your data will still be persisted.`
const ACCOUNT_COPY_DEFAULT = `Once account is connected you will be able to fetch all you instagram photos.`

export default function InstagramPanel() {
    const isAuthenticated = false // TODO
    const onLogout = () => {} //useLogout()

    return (
        <Panel header="Instagram" spacing>
            {isAuthenticated ? ACCOUNT_COPY_AUTHED : ACCOUNT_COPY_DEFAULT}
            <Separator />
            {isAuthenticated ? <Button onClick={onLogout} icon={IoLogoInstagram}>Disconnect</Button> : <AuthenticateButton />}
        </Panel>
    )
}
