import Panel from "components/Panel"
import { useIsAuthenticated, useLogout } from "domain/swarm"
import { IoLogoFoursquare } from "react-icons/io"
import AuthenticateButton from "bindings/swarm/AuthenticateButton"
import Button from "components/Button"
import Separator from "components/Separator"

const ACCOUNT_COPY_AUTHED = `You can disconnect your swarm/foursquare account anytime. You will no longer be able to update checkin list, but your data will still be persisted.`
const ACCOUNT_COPY_DEFAULT = `Once account is connected you will be able to fetch checkin data.`

export default function SwarmPanel() {
    const isAuthenticated = useIsAuthenticated()
    const onLogout = useLogout()

    return (
        <Panel header="Swarm" spacing>
            {isAuthenticated ? ACCOUNT_COPY_AUTHED : ACCOUNT_COPY_DEFAULT}
            <Separator />
            {isAuthenticated ? <Button onClick={onLogout} icon={IoLogoFoursquare}>Disconnect</Button> : <AuthenticateButton />}
        </Panel>
    )
}
