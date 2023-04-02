import { styled } from 'goober'
import { Link } from 'react-router-dom'
import colors from '../colors'

const Container = styled('div')`
    display: flex;
    flex-direction: column;
    padding-bottom: 12px;
    padding-left: 0px;
    margin-bottom: 12px;
    min-width: 400px;
    color: ${props => props.theme.text};
`
const Content = styled('div')`
    display: flex;
    flex-direction: column;
    background-color: ${props => props.theme.background.default};
    white-space: pre-wrap;
    
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid ${props => props.theme.border};
    box-shadow: 0px 2px 3px ${props => props.theme.shadow};
`

const Header = styled('div')`
    display: flex;
    flex-direction: row;
    font-weight: bold;
    font-size: 20px;
    padding: 8px;
    padding-left: 12px;
    color: ${props => props.theme.text};
`

export default function Panel({ style, header, flex, children, spacing, margin, contentStyle = {}, ...props }) {
    const _contentStyle = {...contentStyle, ...(spacing ? { padding: 14 } : {}) }
    const _containerStyle = {...style, ...(flex ? {flex: 1} : {}), ...(margin ? { marginRight: 22, paddingRight: 14 } : {})}
    return (
        <Container style={_containerStyle} {...props}>
            {header ? <Header>{header}</Header> : null}
            <Content style={_contentStyle}>
                {children}
            </Content>
        </Container>
    )
}

export const StaticRow = styled('div')`
    display: flex;
    flex-direction: row;
    align-items: center;

    border-bottom: 1px solid ${props => props.theme.border};
    padding: 4px;
    padding-left: 10px;
    margin-bottom: -1px;
`

export const LinkRow = styled(Link)`
    display: flex;
    flex-direction: row;
    align-items: center;

    border-bottom: 1px solid ${props => props.theme.border};
    border-top: 1px solid transparent;
    padding: 4px;
    padding-left: 10px;
    margin-bottom: -1px;

    color: ${props => props.theme.text};
    text-decoration: none;
    cursor: pointer;

    &:hover {
        border-top: 1px solid ${props => props.theme.border};
        background-color: ${props => props.theme.background.highlight};
    }
`

export const ClickRow = styled('div')`
    display: flex;
    flex-direction: row;
    align-items: center;

    border-bottom: 1px solid ${props => props.theme.border};
    border-top: 1px solid transparent;
    padding: 4px;
    padding-left: 10px;
    margin-bottom: -1px;

    color: ${props => props.theme.text};
    text-decoration: none;
    cursor: pointer;

    &:hover {
        border-top: 1px solid ${props => props.theme.border};
        background-color: ${props => props.theme.background.highlight};
    }
`

export function Row({ to, onClick, ...props }) {
    if (to) {
        return <LinkRow to={to} {...props}/>
    } else if (onClick) {
        return <ClickRow onClick={onClick} {...props}/>
    } else {
        return <StaticRow {...props}/>
    }
}