import { styled } from 'goober'
import { Link, useResolvedPath, useMatch } from 'react-router-dom'

const StyledLink = styled(Link)`
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

export default function PillLink({ icon, children, to, ...props }) {
    const resolved = useResolvedPath(to)
    const match = useMatch({ path: resolved.pathname + '/*' }) && typeof to === 'string'
    const PillIcon = icon
  
    return (
        <StyledLink
          style={match ? { backgroundColor: '#4fa177', color: 'white' } : {}}
          to={to}
          {...props}
        >
            {PillIcon ? <LinkIcon><PillIcon /></LinkIcon> : null}
            {children ? <Separator /> : null}
            {children}
        </StyledLink>
    )
}