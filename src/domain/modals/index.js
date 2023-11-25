import { useContext, useState, createContext } from "react"
import ImportStaysModal from "./ImportStaysModal"
import ImportToursModal from "./ImportToursModal"

export const ModalsContext = createContext({})

export const MODAL = {}

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
        </ModalsContext.Provider>
    )
}

export function useOpenModal() {
    const context = useContext(ModalsContext)
    return (modal) => context.setOpenModal(modal)
}