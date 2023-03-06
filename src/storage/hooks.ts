import { useCallback, useState, useEffect } from "react"
import { StorageAdapter } from "storage"

type setFunction<Type> = (state: Type) => void

export function useStatePersistedCallback<Type>(currentState: Type, setState: setFunction<Type>, persistState: setFunction<Type>) {
    return useCallback((newState: Type) => {
        persistState(newState)
        setState(newState)
    }, [currentState])
}

export function useSyncedStorage<T>(storage: StorageAdapter<T>) {
    const [data, setDataState] = useState(storage.initialValue)
    useEffect(() => {
        storage.get().then(setDataState)
    }, [storage])
    const setData = useStatePersistedCallback(data, setDataState, storage.set.bind(storage))
    return [data, setData]
}
