import { useEffect, useRef, useState } from 'react'
import Page from 'components/Page'
import Panel from 'components/Panel'
import { useAllCountryCodes, useVisitedCountryCodes } from 'domain/stats'
import MapSVG from './map.jsx'
import { useThemeColors } from 'domain/theme'
import getStyles from './styles'
import CountryModal from 'bindings/CountryModal'
import PinButton from 'components/PinButton'
import { TbShare } from 'react-icons/tb'
import toast from 'react-hot-toast'
import { getWebsiteRoot, useIsPresent } from 'environment'
import { useSearchParams } from 'react-router-dom'

function Map({ onCountryClick, countryCodes }) {
    const listeners = useRef([])
    const themeColors = useThemeColors()
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

function useParamsCountries() {
    const [params] = useSearchParams()
    const countries = params.get('countries')
    if (!countries) {
        return null
    }
    return countries.toUpperCase().split(',')
}

export default function Context() {
    const [openedCountry, setOpenedCountry] = useState()
    const isPresent = useIsPresent()
    const paramsCountryCodes = useParamsCountries()
    const countryCodes = useVisitedCountryCodes()
    const onCountryClick = (cc) => {
        if (!isPresent) { setOpenedCountry(cc) }
    }
    const onClickAway = (cc) => setOpenedCountry(undefined)
    const onShareClick = () => {
        const codes = countryCodes.map(c => c.toLowerCase()).join(',')
        const link = `${getWebsiteRoot()}/map?mode=present&countries=${codes}`
        navigator.clipboard.writeText(link)
        toast.success('Link copied to your clipboard')
    }

    return (
        <Page header="Map" right={isPresent ? null : <PinButton icon={TbShare} onClick={onShareClick} tooltip="Share current map" tooltipPosition="left" tooltipOffset={122}/>}>
            <Panel contentStyle={{height: '80vh'}}>
                <Map onCountryClick={onCountryClick} countryCodes={isPresent ? paramsCountryCodes : countryCodes} />
            </Panel>
            <CountryModal countryCode={openedCountry} onClickAway={onClickAway} />
        </Page>
    )
}