import { createContext, useState, useContext, useEffect } from "react"
import { Status, Origin } from "./types"
import CapturingModal from "./CapturingModal"
import CapturingErrorModal from './CapturingErrorModal'

export const CURRENT_VERSION = '0.1.3'

export const ExtensionContext = createContext({})

function sendExtensionMessage(msg) {
    window.postMessage({
        source: Origin.Garden,
        ...msg,
    }, '*')
}

export function ExtensionProvider({ children }) {
    const [version, setVersion] = useState()
    const [initFailed, setInitFailed] = useState(false)
    const [captureError, setCaptureError] = useState()
    const [capturing, setCapturing] = useState(false)
    const [captured, setCaptured] = useState()

    useEffect(() => {
        async function eventListener(event) {
            const message = event.data
            if (!message) { return }
            if (message.source === Origin.Service || message.source === Origin.Extension) {
                if (message.type === 'init') {
                    setVersion(message.version)
                } else if (message.type === 'init_failed') {
                    setInitFailed(true)
                } else if (message.type === 'capture_finished') {
                    setCapturing(false)
                    setCaptured(message)
                } else if (message.type === 'error') {
                    setCaptureError({ error: message.error, location: message.location, stack: message.stack })
                    setCapturing(false)
                }
            }
        }
        if (!initFailed) {
            window.addEventListener('message', eventListener)
            sendExtensionMessage({ type: 'wake_up' })
        }
        return () => window.removeEventListener('message', eventListener)
    }, [initFailed, setInitFailed, setCapturing, setVersion])

    async function startCapture(subject, props) {
        setCapturing(true)
        setCaptureError(undefined)
        sendExtensionMessage({ type: 'start_capture', subject, target: Origin.Extension, ...props })
    }

    const value = {
        isConnected: !!version,
        version,
        initFailed,
        startCapture,
        capturing,
        captured,
        clearCaptured: () => setCaptured(undefined),
    }

    return (
        <ExtensionContext.Provider value={value}>
            {children}
            <CapturingModal isOpen={capturing} />
            <CapturingErrorModal 
                isOpen={!!captureError}
                error={captureError?.error}
                location={captureError?.location}
                stack={captureError?.stack}
                onClickAway={() => setCaptureError(undefined)}
            />
        </ExtensionContext.Provider>
    )
}

export function useExtensionStatus() {
    const context = useContext(ExtensionContext)
    if (context.initFailed) {
        return Status.InitFailed
    } else if (context.version && context.version !== CURRENT_VERSION) {
        return Status.Incompatible
    } else if (context.capturing) {
        return Status.Capturing
    } else if (context.isConnected) {
        return Status.Connected
    } else {
        return Status.Unknown
    }
}

export function useStartCapture() {
    const context = useContext(ExtensionContext)
    return context.startCapture
}

export function useCaptured() {
    const context = useContext(ExtensionContext)
    return context.captured
}

export function useClearCaptured() {
    const context = useContext(ExtensionContext)
    return context.clearCaptured
}
