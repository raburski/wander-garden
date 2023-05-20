import { styled } from "goober"
import { motion, AnimatePresence } from "framer-motion"

const ModalContainer = styled(motion.div)`
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
    z-index: 7;
`

const ModalWindow = styled(motion.div)`
    align-self: center;
    display: flex;
    flex-direction: column;
    min-height: 200px;
    min-width: 200px;
    max-width: 90%;
    max-height: 90%;
    background-color: ${props => props.theme.background.default};
    border-radius: 6px;
    overflow-y: scroll;
    overflow-x: hidden;
    box-shadow: 0px 2px 10px ${props => props.theme.shadow};
`

function onWindowClick(e) {
    e.cancelBubble = true
    e.stopPropagation && e.stopPropagation()
}

export default function Modal({ isOpen, onClickAway, children }) {
    return (
        <AnimatePresence>
            {isOpen ? 
                <ModalContainer 
                    key="modal"
                    onClick={onClickAway}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <ModalWindow
                        onClick={onWindowClick}
                        initial={{y: 200}}
                        animate={{y: 0}}
                        exit={{y: 2000}}
                    >
                        {children}
                    </ModalWindow>
                </ModalContainer>
            : null}
        </AnimatePresence>
    )
}