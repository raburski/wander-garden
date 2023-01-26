import { useState, useEffect } from 'react'
import { jsonTransforms, LocalStorageAdapter, useStatePersistedCallback } from 'storage'

const localStoragePersistedEffect = new LocalStorageAdapter('persisted_effect', '{}', jsonTransforms)
const initialLocalStoragePersistedEffectValue = localStoragePersistedEffect.get()

const hashCode = (str) => str.split('').reduce((s, c) => Math.imul(31, s) + c.charCodeAt(0) | 0, 0)

export default function usePersistedEffect(fn, deps) {
    const [persists, setPersistsState] = useState(initialLocalStoragePersistedEffectValue)
    const setPersists = useStatePersistedCallback(persists, setPersistsState, localStoragePersistedEffect.set.bind(localStoragePersistedEffect))

    useEffect(() => {
        const fnID = hashCode(fn.toString())
        const persistedDeps = persists[fnID]
        const currentDeps = hashCode(deps.toString())

        if (persistedDeps !== currentDeps) {
            persists[fnID] = currentDeps
            setPersists(persists)
            fn()
        }
    }, deps)
}