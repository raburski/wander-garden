import Page from "components/Page"
import Panel from "components/Panel"
import ThemeChange from "./ThemeChange"
import SwarmPanel from "./SwarmPanel"
import DataPanel from "./DataPanel"

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
            <DataPanel />
        </Page>
    )
}