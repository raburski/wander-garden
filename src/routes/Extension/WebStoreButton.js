import Button from '../../components/Button'
import { FiExternalLink } from 'react-icons/fi'

const openExtensionWebsite = () => window.open()
export default function WebStoreButton() {
    return <Button icon={FiExternalLink} onClick={openExtensionWebsite}>Open Chrome Web Store</Button>
}