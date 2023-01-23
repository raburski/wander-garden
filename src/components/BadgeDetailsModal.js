import Panel from 'components/Panel'
import Modal from 'components/Modal'
import CountryRow from 'components/CountryRow'
import Page from 'components/Page'

import { VscCheck } from 'react-icons/vsc'

export default function BadgeDetailsModal({ selectedBadge, onClickAway}) {
    return (
        <Modal isOpen={!!selectedBadge} onClickAway={onClickAway}>
            <Page header={selectedBadge?.name}>
            <Panel header="Countries in the region">
                {selectedBadge?.oneOfCountry?.map(cc => <CountryRow key={cc} code={cc} right={selectedBadge.matching.includes(cc) ? <VscCheck /> : null}/>)}
            </Panel>
            </Page>
        </Modal>
    )
}
