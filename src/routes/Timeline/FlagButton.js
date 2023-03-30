import { Link } from "react-router-dom"
import colors from "colors"
import { styled } from 'goober'
import { motion } from 'framer-motion'

const MotionLink = motion(Link)

const StyledFlagButton = styled(MotionLink)`
    display: flex;
    color: inherit;
    background-color: white;
    border: 1px solid white;
    text-decoration: none;
    cursor: pointer;
    padding-left: 4px;
    padding-right: 4px;
    padding-top: 1px;
    border-radius: 6px;
    font-size: 28px;
    box-shadow: 0px 1px 8px rgba(255, 255, 255, 0);
`

const SELECTED = {scale: 1.25, backgroundColor: 'white', borderColor: colors.border.normal, boxShadow: '0px 1px 8px rgba(22, 22, 26, 0.16)'}
const NOT_SELECTED = { backgroundColor: 'white' }

export default function FlagButton({ selected = false, ...props }) {
    const Flag = StyledFlagButton //selected ? SelectedFlagButton : StyledFlagButton
    return <Flag animate={selected ? SELECTED : NOT_SELECTED} whileHover={{backgroundColor: colors.neutral.highlight}} {...props}/>
}