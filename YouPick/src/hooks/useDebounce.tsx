import { useEffect, useState } from 'react'

export default function useDebounce<T>(value: T, timeout: number = 1000) {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const timeoutId: NodeJS.Timeout = setTimeout(() => {
            setDebouncedValue(value)
        }, timeout)
        return () => clearTimeout(timeoutId)
    }, [value, timeout])

    return debouncedValue
}
