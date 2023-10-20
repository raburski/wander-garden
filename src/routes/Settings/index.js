import Page from "components/Page"
import SwarmPanel from "./SwarmPanel"
import DataPanel from "./DataPanel"
import InterfacePanel from "./InterfacePanel"

export default function SettingsPage() {
    return (
        <Page header="Settings">
            <InterfacePanel />
            <SwarmPanel />
            <DataPanel />
        </Page>
    )
}