import Modal from 'components/Modal'
import Page from 'components/Page'
import Button from 'components/Button'
import { styled } from 'goober'
import { VscChromeClose } from 'react-icons/vsc'

export const ModalPageButtons = styled('div')`
    display: flex;
    justify-content: space-between;
    margin-bottom: 22px;
    padding-top: 12px;
    align-self: stretch;
`

const CloseButton = styled(Button)`
    border-radius: 28px;
    border-width: 0px;
    box-shadow: 0px 0px 0px;
    margin-top: -4px;
    margin-right: -2px;
`


export default function ModalPage({ isOpen, onClickAway, header, children, pageStyle, ...props }) {
    return (
        <Modal isOpen={isOpen} onClickAway={onClickAway}>
            <Page   
                header={header}
                right={onClickAway ? <CloseButton icon={VscChromeClose} onClick={onClickAway}/> : null}
                style={pageStyle}
                isModal
                {...props}
            >
                {children}
            </Page>
        </Modal>
    )
}
