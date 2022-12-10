import Page from "../../components/Page"
import WhatIsWanderGarden from "./WhatIsWanderGarden"
import Contact from './Contact'

export default function WebsiteInfo() {
    return (
        <Page header="Website Info">
            <WhatIsWanderGarden />
            <Contact />
        </Page>
    )
}