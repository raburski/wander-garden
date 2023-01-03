import Button from './Button'
import { ImCheckboxChecked, ImCheckboxUnchecked } from 'react-icons/im'

export default function ToggleButton({ checked, onClick, children }) {
    const Icon = checked ? ImCheckboxChecked : ImCheckboxUnchecked
    return <Button icon={Icon} onClick={onClick}>{children}</Button>
}
