import Panel from 'components/Panel'
import Modal from 'components/Modal'
import CountryRow from 'components/CountryRow'
import Page from 'components/Page'
import ModalPage from 'components/ModalPage'

import { VscCheck } from 'react-icons/vsc'
import countryFlagEmoji from 'country-flag-emoji'
import { styled } from 'goober'

const Flag = styled('span')`
    margin-bottom: -5px;
    margin-right: 12px;
    font-size: 42px;
`

export default function CountryModal({ countryCode, onClickAway }) {
    const country = countryFlagEmoji.get(countryCode)
    const header = <><Flag>{country.emoji}</Flag>{country.name}</>
    return (
        <ModalPage isOpen={!!countryCode} header={header} onClickAway={onClickAway}>
            {/* <Panel header="Countries in the region">
            </Panel> */}
        </ModalPage>
    )
}
