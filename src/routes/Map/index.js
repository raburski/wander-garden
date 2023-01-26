import Page from '../../components/Page'
import Panel from '../../components/Panel'
import { useVisitedCountryCodes } from 'domain/timeline'
import colors from "../../colors"
import MapSVG from './map.jsx'

function Map() {
    const [countryCodes] = useVisitedCountryCodes()
    const mapStyles = countryCodes.map(cc => `
      #worldmap #${cc.toLowerCase()} { fill: ${colors.primary.default}; }
      #worldmap #${cc.toLowerCase()}:hover { fill: #67c293; }
      #worldmap #${cc.toLowerCase()} path { fill: ${colors.primary.default}; }
      #worldmap #${cc.toLowerCase()} path:hover { fill: #67c293; }
    `).join('')
    return (
      <>
        <style>{mapStyles}</style>
        <MapSVG />
      </>
    )
}

export default function Context() {
    return (
        <Page header="Map">
            <Panel contentStyle={{height: '80vh'}}>
                <Map />
            </Panel>
        </Page>
    )
}