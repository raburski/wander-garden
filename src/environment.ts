import { useSearchParams } from "react-router-dom"

export function isDEV(): Boolean {
    return process.env.NODE_ENV == 'development'
}

export function getWebsiteRoot(): string {
    const host = window.location.host
    const protocol = window.location.protocol
    return `${protocol}//${host}`
}

export function useIsPresent(): boolean {
    const [params] = useSearchParams()
    const mode = params.get('mode')?.toLowerCase()
    return mode?.toLowerCase() === 'present'
}