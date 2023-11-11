import { Link } from "react-router-dom"
import { styled } from 'goober'
import { motion } from 'framer-motion'
import { useThemeColors } from "domain/theme"

const MotionLink = motion(Link)

const Flag = styled(MotionLink)`
    display: flex;
    color: ${props => props.theme.text};
    background-color: transparent;
    border: 1px solid ${props => props.theme.background.default};;
    text-decoration: none;
    cursor: pointer;
    margin-left: 1px;
    margin-right: 1px;
    padding-left: 4px;
    padding-right: 4px;
    padding-top: 1px;
    border-radius: 6px;
    font-size: 24px;
`

const SCALE = 1.3

export default function FlagButton({ selected = false, ...props }) {
    const colors = useThemeColors()
    const SELECTED = {scale: SCALE, backgroundColor: colors.primary.highlight, borderColor: colors.primary.default }
    const NOT_SELECTED = { backgroundColor: 'transparent', borderColor: 'transparent' }
    const WHILE_HOVER = { scale: SCALE }
    return <Flag animate={selected ? SELECTED : NOT_SELECTED} whileHover={WHILE_HOVER} {...props}/>
}