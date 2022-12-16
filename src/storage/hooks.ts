import { useCallback } from "react"

type setFunction<Type> = (state: Type) => void

export function useStatePersistedCallback<Type>(currentState: Type, setState: setFunction<Type>, persistState: setFunction<Type>) {
    return useCallback((newState: Type) => {
        setState(newState)
        persistState(newState)
    }, [currentState])
}