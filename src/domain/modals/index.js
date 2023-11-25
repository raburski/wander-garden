import { useContext, useState, createContext } from "react"
import ImportStaysModal from "./ImportStaysModal"
import ImportToursModal from "./ImportToursModal"
import StartSwarmUpdateModal from "./StartSwarmUpdateModal"


export const ModalsContext = createContext({})

export const MODAL = {
    CHECKIN_UPDATE: 'checkin_update'
}

export default function ModalsProvider({ children }) {
    const [openModal, setOpenModal] = useState()

    const value = {
        openModal,
        setOpenModal,
    }

    return (
        <ModalsContext.Provider value={value}>
            {children}
            <ImportStaysModal />
            <ImportToursModal />
            <StartSwarmUpdateModal isOpen={openModal === MODAL.CHECKIN_UPDATE} onCancel={() => setOpenModal(false)}/>
        </ModalsContext.Provider>
    )
}

export function useOpenModal(modal) {
    const context = useContext(ModalsContext)
    return () => context.setOpenModal(modal)
}