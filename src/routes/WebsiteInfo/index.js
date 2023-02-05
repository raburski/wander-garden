import Page from "../../components/Page"
import WhatIsWanderGarden from "./WhatIsWanderGarden"
import Contact from './Contact'
import WIPWarning from './WIPWarning'

export default function WebsiteInfo() {
    return (
        <Page header="Website Info">
            <WIPWarning />
            <WhatIsWanderGarden />
            <Contact />
        </Page>
    )
}