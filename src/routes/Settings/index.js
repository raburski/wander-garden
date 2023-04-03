import Page from "components/Page"
import Panel from "components/Panel"
import ThemeChange from "./ThemeChange"

export default function SettingsPage() {
    return (
        <Page header="Settings">
            <Panel header="Interface" spacing>
                <ThemeChange />
            </Panel>
        </Page>
    )
}