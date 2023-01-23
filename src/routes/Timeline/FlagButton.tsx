import { Link } from "react-router-dom"
import colors from "colors"
import { styled } from 'goober'

const StyledFlagButton = styled(Link as unknown as JSX.Element)`
    display: flex;
    color: inherit;
    text-decoration: none;
    cursor: pointer;
    padding-left: 4px;
    padding-right: 4px;
    border-radius: 6px;
    font-size: 28px;

    &:hover {
        background-color: ${colors.neutral.highlight};
    }
`

export type FlagButtonProps = { selected: boolean }
export default function FlagButton({ selected = false, ...props }) {
    // TODO: fix types and and style back
    const style: any = selected ? {backgroundColor: colors.neutral.dark} : {}
    return <StyledFlagButton {...props}/>
}