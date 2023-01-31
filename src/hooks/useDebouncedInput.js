import { useState, useEffect } from 'react'

export default function useDebouncedInput(debounce = 300) {
    const [currentValue, setCurrentValue] = useState()
    const [delayedValue, setDelayedValue] = useState()
    const onChange = (event) => {
        setCurrentValue(event.target.value)
    }
    useEffect(() => {
        const debounced = setTimeout(() => {
            setDelayedValue(currentValue)
        }, debounce)
        return () => clearTimeout(debounced)
    }, [currentValue])
    return [delayedValue, onChange]
}