import { styled } from 'goober'
import { Link, useResolvedPath, useMatch } from 'react-router-dom'
import { motion } from 'framer-motion'

const MotionLink = motion(Link)

const StyledLink = styled(MotionLink)`
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 1px;
    padding: ${props => props.small ? '2px' : '6px'};
    padding-left: ${props => props.small ? '10px' : '18px'};
    padding-right: ${props => props.small ? '10px' : '18px'};
    border-radius: 26px;
    text-decoration: none;
    color: ${props => props.theme.text};
    font-family: Primary;
    font-size: ${props => props.small ? '12px' : '15px'};

    &:hover {
        background-color: ${props => props.theme.primary.highlight};
    }
    &:active {
        background-color: ${props => props.theme.primary.active};
    }
`

const LinkIcon = styled('div')`
    margin-top: ${props => props.small ? '4px' : '7px'};
    font-size: ${props => props.small ? '16px' : '20px'};
`

const Separator = styled('div')`
    width: 10px;
`

const WHILE_HOVER = {scale:1.02}
const WHILE_TAP = {scale:0.98}

export default function PillLink({ icon, children, small, to, style, ...props }) {
    const resolved = useResolvedPath(to)
    const match = useMatch({ path: resolved.pathname + '/*' }) && typeof to === 'string'
    const PillIcon = icon
  
    return (
        <StyledLink
          style={match ? { backgroundColor: '#4fa177', color: 'white', ...style } : style}
          to={to}
          whileHover={WHILE_HOVER}
          whileTap={WHILE_TAP}
          small={small}
          {...props}
        >
            {PillIcon ? <LinkIcon small={small}><PillIcon /></LinkIcon> : null}
            {children ? <Separator /> : null}
            {children}
        </StyledLink>
    )
}