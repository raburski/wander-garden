import Button from '../../components/Button'
import { FiExternalLink } from 'react-icons/fi'

const EXTENSION_URL = 'https://chrome.google.com/webstore/detail/wander-garden/cemaffccdpdkiohecphcfhclejlbfjpa'
const openExtensionWebsite = () => window.open(EXTENSION_URL)
export default function WebStoreButton() {
    return <Button icon={FiExternalLink} onClick={openExtensionWebsite}>Open Chrome Web Store</Button>
}