import { useEffect, useRef, useState } from 'react'
import Page from 'components/Page'
import Panel from 'components/Panel'
import { useAllCountryCodes, useVisitedCountryCodes } from 'domain/stats'
import MapSVG from './map.jsx'
import { useThemeColors } from 'domain/theme'
import getStyles from './styles'
import CountryModal from 'bindings/CountryModal'

function Map({ onCountryClick }) {
    const listeners = useRef([])
    const themeColors = useThemeColors()
    const countryCodes = useVisitedCountryCodes()
    const allCountryCodes = useAllCountryCodes()
    const mapStyles = getStyles(countryCodes, themeColors)

    useEffect(() => {
        listeners.current.forEach(({ cc, listener }) => 
            document.querySelector(`#worldmap #${cc.toLowerCase()}`).removeEventListener('click', listener)
        )
        listeners.current = allCountryCodes.map(cc => {
            const selector = `#worldmap #${cc.toLowerCase()}`
            const onClick = () => onCountryClick(cc)
            const element = document.querySelector(selector)
            if (element) {
                return { cc, listener: document.querySelector(selector).addEventListener('click', onClick) }
            } else {
                return null
            }
        }).filter(Boolean)
    }, [onCountryClick, allCountryCodes])

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