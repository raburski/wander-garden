import { useEffect } from 'react'
import { _token } from '../../swarm/singletons'
import { styled } from 'goober'
import InfoPanel from '../../components/InfoPanel'
import SquareImage from '../../components/SquareImage'

const Container = styled('div')`
    display: flex;
    flex: 1;
    height: 100%;
    align-self: stretch;
    align-items: center;
    justify-content: center;
`

function SwarmImage() {
    return <SquareImage src="/3d/beegarden1.png" />
}

const STATUS = {
    SUCCESS: 1,
    FAILED: 2,
    ALREADY_AUTHENTICATED: 3,
}

function checkAuthenticationStatus() {
    const url_token = new URL(window.location.href).searchParams.get('access_token')
    const access_token = _token.get()
    if (access_token) {
        return STATUS.ALREADY_AUTHENTICATED
    }
    if (!access_token && !url_token) {
        return STATUS.FAILED
    }
    _token.set(url_token)
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
    const status = checkAuthenticationStatus()

    useStatusEffect(status)

    return (
        <Container>
            <StatusPanel status={status}/>
        </Container>
    )
}

