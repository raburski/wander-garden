import { Link } from "react-router-dom"
import colors from "colors"
import { styled } from 'goober'
import { motion } from 'framer-motion'

const MotionLink = motion(Link)

const StyledFlagButton = styled(MotionLink)`
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
`

export default function FlagButton({ selected = false, ...props }) {
    const Flag = selected ? SelectedFlagButton : StyledFlagButton
    return <Flag animate={selected ? {scale: 1.25} : {scale: 1}} {...props}/>
}