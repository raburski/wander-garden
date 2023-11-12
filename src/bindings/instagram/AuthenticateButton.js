import Button from "components/Button"
import toast from "react-hot-toast"
import { useState } from "react"
import { IoLogoInstagram } from 'react-icons/io'

const CLIENT_ID = '870234791285892'
const REDIRECT_URL = 'https://auth.wander.garden/api/instagram'

const AUTH_URL = `https://api.instagram.com/oauth/authorize?client_id=${CLIENT_ID}&scope=user_profile,user_media&response_type=code&redirect_uri=${REDIRECT_URL}`

function useOnAuthorize() {
    const [authorizing, setAuthorizing] = useState(false)
    function onAuthorize() {
        toast.loading('Redirecting to Instagram...')
        setAuthorizing(true)
        window.location.href = AUTH_URL
    }
    return [authorizing, onAuthorize]
}

export default function AuthenticateButton() {
    const [authorizing, onAuthorize] = useOnAuthorize()
    return <Button icon={IoLogoInstagram} onClick={onAuthorize} disabled={authorizing}>Authorize with Instagram</Button>
}