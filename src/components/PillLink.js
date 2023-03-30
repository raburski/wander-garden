import { styled } from 'goober'
import { Link, useResolvedPath, useMatch } from 'react-router-dom'
import { motion } from 'framer-motion'

const MotionLink = motion(Link)

const StyledLink = styled(MotionLink)`
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 1px;
    padding: 6px;
    padding-left: 18px;
    padding-right: 18px;
    border-radius: 26px;
    text-decoration: none;
    color: black;
    font-family: Primary;
    font-size: 15px;

    &:hover {
        background-color: #ebf2ee;
    }
    &:active {
        background-color: #d5ebe0;
    }
`

const LinkIcon = styled('div')`
    margin-top: 7px;
    font-size: 22px;
`

const Separator = styled('div')`
    width: 10px;
`

const WHILE_HOVER = {scale:1.02}
const WHILE_TAP = {scale:0.98}

export default function PillLink({ icon, children, to, ...props }) {
    const resolved = useResolvedPath(to)
    const match = useMatch({ path: resolved.pathname + '/*' }) && typeof to === 'string'
    const PillIcon = icon
  
    return (
        <StyledLink
          style={match ? { backgroundColor: '#4fa177', color: 'white' } : {}}
          to={to}
          whileHover={WHILE_HOVER}
          whileTap={WHILE_TAP}
          {...props}
        >
            {PillIcon ? <LinkIcon><PillIcon /></LinkIcon> : null}
            {children ? <Separator /> : null}
            {children}
        </StyledLink>
    )
}