import Panel from 'components/Panel'
import Modal from 'components/Modal'
import CountryRow from 'components/CountryRow'
import Page from 'components/Page'
import ModalPage from './ModalPage'

import { VscCheck } from 'react-icons/vsc'

export default function BadgeDetailsModal({ selectedBadge, onClickAway}) {
    return (
        <ModalPage isOpen={!!selectedBadge} header={selectedBadge?.name} onClickAway={onClickAway}>
            <Panel>
                {selectedBadge?.oneOfCountry?.map(cc => <CountryRow key={cc} code={cc} right={selectedBadge.matching.includes(cc) ? <VscCheck /> : null}/>)}
            </Panel>
        </ModalPage>
    )
}
