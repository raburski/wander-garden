import { useEffect } from 'react'
import { useToken } from 'domain/swarm'
import InfoPanel from 'components/InfoPanel'
import SquareImage from 'components/SquareImage'
import CenterChildren from 'components/CenterChildren'

function SwarmImage() {
    return <SquareImage src="/3d/beegarden1.png" />
}

const STATUS = {
    SUCCESS: 1,
    FAILED: 2,
    ALREADY_AUTHENTICATED: 3,
}

function useAuthenticationStatus() {
    const [token, setToken] = useToken()
    const url_token = new URL(window.location.href).searchParams.get('access_token')
    if (token) {
        return STATUS.ALREADY_AUTHENTICATED
    }
    if (!token && !url_token) {
        return STATUS.FAILED
    }
    setToken(url_token)
    return STATUS.SUCCESS
}

function Success() {
    return (
        <InfoPanel
            spacing
            image={<SwarmImage />}
            title="Succesfully authenticated!"
            text="Redirecting you to dashboard..."
        />
    )
}

function Failed() {
    return (
        <InfoPanel
            spacing
            image={<SwarmImage />}
            title="FAILED!"
            text="Authentication has failed for unknown reason."
        />
    )
}

function AlreadyAuthenticated() {
    return (
        <InfoPanel
            spacing
            image={<SwarmImage />}
            title="Already authenticated!"
            text="You are already logged in and can use swarm features."
        />
    )
}

function StatusPanel({ status }) {
    switch (status) {
        case STATUS.SUCCESS:
            return <Success />
        case STATUS.FAILED:
            return <Failed />
        case STATUS.ALREADY_AUTHENTICATED:
            return <AlreadyAuthenticated />
        default:
            return <Failed />
    }
}

function useStatusEffect(status) {
    useEffect(() => {
        if (status === STATUS.SUCCESS) {
            setTimeout(() => window.location = '/', 2500)
        }
    })
}

export default function AuthenticationFinish() {
    const status = useAuthenticationStatus()

    useStatusEffect(status)

    return (
        <CenterChildren>
            <StatusPanel status={status}/>
        </CenterChildren>
    )
}

