import Page from "../components/Page"
import InfoPanel from "../components/InfoPanel"
import SquareImage from '../components/SquareImage'

export default function PhoneConnect() {
    return (
        <Page header="Phone connect" >
            <InfoPanel spacing image={<SquareImage src="/3d/junglesmartphone.png" size={180}/>}>
                This place will allow you to select photos taken with your phone. Browser will extract location and time metadata and then add new events to your garden. STILL WIP!
                <br/><br/><input type="file" accept="image/*" multiple/>
            </InfoPanel>
        </Page>
    )
}