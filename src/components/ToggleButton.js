import { styled } from 'goober'
import Button from './Button'

const StyledToggleButton = styled('button')`
    background-color: #fafafa;
    border: 1px solid #ebebeb;
    border-radius: 4px;
    padding: 6px;
    padding-left: 8px;
    padding-right: 10px;
    cursor: pointer;
`

export default function ToggleButton({ checked, onClick, children }) {
    const icon = checked ? '🔳' : '⬜️'
    return <Button onClick={onClick}>{icon}&nbsp;&nbsp;&nbsp;{children}</Button>
}
