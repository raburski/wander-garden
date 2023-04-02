import { Link } from "react-router-dom"
import { styled } from 'goober'
import { motion } from 'framer-motion'
import { useThemeColors } from "domain/theme"

const MotionLink = motion(Link)

const Flag = styled(MotionLink)`
    display: flex;
    color: ${props => props.theme.text};
    background-color: ${props => props.theme.background.default};
    border: 1px solid ${props => props.theme.background.default};;
    text-decoration: none;
    cursor: pointer;
    padding-left: 4px;
    padding-right: 4px;
    padding-top: 1px;
    border-radius: 6px;
    font-size: 28px;
    box-shadow: 0px 1px 8px rgba(255, 255, 255, 0);
`

export default function FlagButton({ selected = false, ...props }) {
    const colors = useThemeColors()
    const SELECTED = {scale: 1.25, backgroundColor: colors.background.default, borderColor: colors.border, boxShadow: `0px 1px 8px ${colors.shadow}`}
    const NOT_SELECTED = { backgroundColor: colors.background.default }
    return <Flag animate={selected ? SELECTED : NOT_SELECTED} whileHover={{backgroundColor: colors.background.active}} {...props}/>
}