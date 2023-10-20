import Page from "components/Page"
import Panel from "components/Panel"
import ThemeChange from "./ThemeChange"
import { useIsAuthenticated, useLogout } from "domain/swarm"
import { IoLogoFoursquare } from "react-icons/io"
import AuthenticateButton from "bindings/swarm/AuthenticateButton"
import Button from "components/Button"

const ACCOUNT_COPY_AUTHED = `You can disconnect your swarm/foursquare account anytime. You will no longer be able to update checkin list, but your data will still be persisted.

`
const ACCOUNT_COPY_DEFAULT = `Once account is connected you will be able to fetch checkin data.

`

function SwarmPanel() {
    const isAuthenticated = useIsAuthenticated()
    const onLogout = useLogout()

    return (
        <Panel header="Swarm" spacing>
            {isAuthenticated ? ACCOUNT_COPY_AUTHED : ACCOUNT_COPY_DEFAULT}
            {isAuthenticated ? <Button onClick={onLogout} icon={IoLogoFoursquare}>Disconnect</Button> : <AuthenticateButton />}
        </Panel>
    )
}

function InterfacePanel() {
    return (
        <Panel header="Interface" spacing>
            <ThemeChange />
        </Panel>
    )
}

export default function SettingsPage() {
    return (
        <Page header="Settings">
            <InterfacePanel />
            <SwarmPanel />
        </Page>
    )
}