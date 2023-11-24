import CountryModal from "bindings/CountryModal"
import ModalPage from "components/ModalPage"
import CountryRow from 'components/CountryRow'
import Panel from "components/Panel"
import { useVisitedCountryCodes } from "domain/visitedCountries"
import { useState } from "react"

export function CountriesModal({ ...props }) {
    const [openedCountry, setOpenedCountry] = useState()
    const onCountryClick = (cc) => setOpenedCountry(cc)
    const onClickAway = (cc) => setOpenedCountry(undefined)
    const countryCodes = useVisitedCountryCodes()

    if (countryCodes.length <= 0) {
        return null
    }
    return (
        <ModalPage header="Visited countries" {...props}>
            <Panel>
                {countryCodes.map(cc => <CountryRow code={cc} key={cc} onClick={() => onCountryClick(cc)} />)}
                <CountryModal countryCode={openedCountry} onClickAway={onClickAway}/>
            </Panel>
        </ModalPage>
    )
}