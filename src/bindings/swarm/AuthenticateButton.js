import Button from "components/Button"
import toast from "react-hot-toast"
import { useState } from "react"
import { IoLogoFoursquare } from 'react-icons/io'

const CLIENT_ID = 'JRGEIAQP3LTJWSO2C2U25KSOTLAIPOHOCAWXS31MJXVB1OPP'
const REDIRECT_URL = 'http://wander.garden/auth.php?type=foursquare'

const AUTH_URL = `https://foursquare.com/oauth2/authenticate?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URL}`

function useOnAuthorize() {
    const [authorizing, setAuthorizing] = useState(false)
    function onAuthorize() {
        toast.loading('Redirecting to Foursquare...')
        setAuthorizing(true)
        window.location.href = AUTH_URL
    }
    return [authorizing, onAuthorize]
}

export default function AuthenticateButton() {
    const [authorizing, onAuthorize] = useOnAuthorize()
    return <Button icon={IoLogoFoursquare} onClick={onAuthorize} disabled={authorizing}>Authorize with Foursquare</Button>
}