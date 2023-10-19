import { useState } from 'react'
import Button from '../../components/Button'
import { FiExternalLink, FiRefreshCw } from 'react-icons/fi'
import ModalPage from 'components/ModalPage'

const EXTENSION_URL = 'https://chrome.google.com/webstore/detail/wander-garden/cemaffccdpdkiohecphcfhclejlbfjpa'
const openExtensionWebsite = () => window.open(EXTENSION_URL)
const refreshWebsite = () => window.location.reload()

const COPY = `Please refresh this page to connect.

`

export default function WebStoreButton(props) {
    const [isOpen, setOpen] = useState(false)
    const onButtonClick = () => {
        openExtensionWebsite()
        setOpen(true)
    }
    const onClickAway = () => setOpen(false)

    return (
        <>
            <ModalPage isOpen={isOpen} onClickAway={onClickAway} header="Extension installed?" pageStyle={{alignItems: 'center', paddingBottom: 32}}>
                {COPY}
                <Button icon={FiRefreshCw} onClick={refreshWebsite} style={{alignSelf: 'center'}}>Refresh</Button>
            </ModalPage>
            <Button icon={FiExternalLink} onClick={onButtonClick} {...props}>Open Chrome Web Store</Button>
        </>
    )
}