import Page from '../../components/Page'
import Panel from '../../components/Panel'
import { useVisitedCountryCodes } from 'domain/timeline'
import MapSVG from './map.jsx'
import { useThemeColors } from 'domain/theme'
import getStyles from './styles'

function Map() {
    const themeColors = useThemeColors()
    const [countryCodes] = useVisitedCountryCodes()
    const mapStyles = getStyles(countryCodes, themeColors)

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