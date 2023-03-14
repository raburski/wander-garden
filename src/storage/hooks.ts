import { useCallback, useState, useEffect } from "react"
import { StorageAdapter } from "storage"

type setAsyncFunction<Type> = (state: Type) => Promise<any>
type setSyncFunction<Type> = (state: Type) => void

export function useStatePersistedCallback<Type>(currentState: Type, setState: setSyncFunction<Type>, persistState: setAsyncFunction<Type>) {
    return useCallback(async function setStateCallback(newState: Type) {
        await persistState(newState)
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
