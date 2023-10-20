import Panel from "components/Panel"
import ThemeChange from "./ThemeChange"
import Separator from "components/Separator"

export default function InterfacePanel() {
    return (
        <Panel header="Interface" spacing>
            Theme
            <Separator />
            <ThemeChange />
        </Panel>
    )
}