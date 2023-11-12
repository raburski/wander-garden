import { useEffect, useState } from 'react'
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

function useTokenSet() {
    const [swarmToken, setSwarmToken] = useToken()
    const [instaToken, setInstaToken] = useState()

    const params = new URL(window.location.href).searchParams
    const url_token = params.get('access_token')
    const url_type = params.get('type')
    if (url_type === 'foursquare') {
        return [url_token, swarmToken, setSwarmToken]
    } else if (url_token === 'instagram') {
        return [url_token, instaToken, setInstaToken]
    }
    return []
}

function useAuthenticationStatus() {
    const [urlToken, savedToken, setToken] = useTokenSet()
    if (savedToken) {
        return STATUS.ALREADY_AUTHENTICATED
    }
    if (!savedToken && !urlToken) {
        return STATUS.FAILED
    }
    setToken(urlToken)
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

