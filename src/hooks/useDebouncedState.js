import { useState, useEffect } from 'react'

export default function useDebouncedState(initialValue, debounce = 300) {
    const [currentValue, setCurrentValue] = useState(initialValue)
    const [delayedValue, setDelayedValue] = useState(initialValue)
    const onChange = (value, applyNow) => {
        if (applyNow) {
            setDelayedValue(value)
        }
        setCurrentValue(value)
    }
    useEffect(() => {
        const debounced = setTimeout(() => {
            setDelayedValue(currentValue)
        }, debounce)
        return () => clearTimeout(debounced)
    }, [currentValue])
    return [delayedValue, onChange]
}