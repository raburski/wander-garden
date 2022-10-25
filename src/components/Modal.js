import { styled } from "goober"

const ModalContainer = styled('div')`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: rgba(0,0,0,0.5);
`

const ModalWindow = styled('div')`
    align-self: center;
    display: flex;
    flex-direction: column;
    min-height: 200px;
    min-width: 200px;
    max-width: 90%;
    max-height: 90%;
    background-color: white;
    border-radius: 6px;
    overflow: scroll;
    box-shadow: 0px 2px 10px rgb(100,100,100);
`

function onWindowClick(e) {
    e.cancelBubble = true
    e.stopPropagation && e.stopPropagation()
}

export default function Modal({ isOpen, onClickAway, children }) {

    if (!isOpen) {
        return null
    }
    return (
        <ModalContainer onClick={onClickAway}>
            <ModalWindow onClick={onWindowClick}>
                {children}
            </ModalWindow>
        </ModalContainer>
    )
}