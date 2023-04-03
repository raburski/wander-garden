import Page from "../../components/Page"
import WhatIsWanderGarden from "./WhatIsWanderGarden"
import Contact from './Contact'
import WIPWarning from './WIPWarning'

export default function About() {
    return (
        <Page header="About">
            <WIPWarning />
            <WhatIsWanderGarden />
            <Contact />
        </Page>
    )
}