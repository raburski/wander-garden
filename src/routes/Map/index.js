import { useEffect, useRef, useState } from 'react'
import Page from 'components/Page'
import Panel from 'components/Panel'
import { useVisitedCountryCodes } from 'domain/stats'
import MapSVG from './map.jsx'
import { useThemeColors } from 'domain/theme'
import getStyles from './styles'
import CountryModal from 'bindings/CountryModal'

function Map({ onCountryClick }) {
    const listeners = useRef([])
    const themeColors = useThemeColors()
    const countryCodes = useVisitedCountryCodes()
    const mapStyles = getStyles(countryCodes, themeColors)

    useEffect(() => {
        listeners.current.forEach(({ cc, listener }) => 
            document.querySelector(`#worldmap #${cc.toLowerCase()}`).removeEventListener('click', listener)
        )
        listeners.current = countryCodes.map(cc => {
            const selector = `#worldmap #${cc.toLowerCase()}`
            const onClick = () => onCountryClick(cc)
            return { cc, listener: document.querySelector(selector).addEventListener('click', onClick) }
        })
    }, [onCountryClick, countryCodes])

    return (
      <>
        <style>{mapStyles}</style>
        <MapSVG />
      </>
    )
}

export default function Context() {
    const [openedCountry, setOpenedCountry] = useState()
    const onCountryClick = (cc) => setOpenedCountry(cc)
    const onClickAway = (cc) => setOpenedCountry(undefined)

    return (
        <Page header="Map">
            <Panel contentStyle={{height: '80vh'}}>
                <Map onCountryClick={onCountryClick}/>
            </Panel>
            <CountryModal countryCode={openedCountry} onClickAway={onClickAway} />
        </Page>
    )
}