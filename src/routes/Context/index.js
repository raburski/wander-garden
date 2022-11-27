import { styled } from "goober"
import PotentialHomes from "./PotentialHomes"
import PotentialDowntimes from './PotentialDowntimes'
import PotentialTrips from "./PotentialTrips"
import Page from '../../components/Page'

export default function Context() {
    return (
        <Page header="Context">
            <PotentialHomes />
            {/* <PotentialDowntimes /> */}
            {/* <PotentialTrips /> */}
        </Page>
    )
}