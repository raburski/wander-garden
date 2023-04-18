import Modal from 'components/Modal'
import Page from 'components/Page'
import { styled } from 'goober'

export const ModalPageButtons = styled('div')`
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    padding-top: 12px;
    align-self: stretch;
`

export default function ModalPage({ isOpen,onClickAway, header, children, pageStyle }) {
    return (
        <Modal isOpen={isOpen} onClickAway={onClickAway}>
            <Page header={header} style={pageStyle}>
                {children}
            </Page>
        </Modal>
    )
}
