import Page from "components/Page"
import SwarmPanel from "./SwarmPanel"
import DataPanel from "./DataPanel"
import InterfacePanel from "./InterfacePanel"
import InstagramPanel from "./InstagramPanel"
import { isDEV } from "environment"
import Footer from "components/Footer"

export default function SettingsPage() {
    return (
        <Page header="Settings">
            <InterfacePanel />
            {isDEV() ? <InstagramPanel /> : null}
            <SwarmPanel />
            <DataPanel />
            <Footer />
        </Page>
    )
}