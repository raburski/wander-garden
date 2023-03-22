import { Link } from "react-router-dom"
import colors from "colors"
import { styled } from 'goober'

const StyledFlagButton = styled(Link as unknown as JSX.Element)`
    display: flex;
    color: inherit;
    border: 1px solid white;
    text-decoration: none;
    cursor: pointer;
    padding-left: 4px;
    padding-right: 4px;
    padding-top: 1px;
    border-radius: 6px;
    font-size: 28px;

    &:hover {
        background-color: ${colors.neutral.highlight};
    }
`

const SelectedFlagButton = styled(StyledFlagButton)`
    background-color: white;//${colors.neutral.highlight};
    border: 1px solid ${colors.border.normal};
    box-shadow: 0px 1px 8px rgba(22, 22, 26, 0.16);
    transform: scale(1.25, 1.25);
`

export type FlagButtonProps = { selected: boolean }
export default function FlagButton({ selected = false, ...props }) {
    const Flag = selected ? SelectedFlagButton : StyledFlagButton
    return <Flag {...props}/>
}