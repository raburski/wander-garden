import { styled } from 'goober'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const Container = styled(motion.div)`
    display: flex;
    flex-direction: column;
    padding-bottom: 12px;
    padding-left: 0px;
    margin-bottom: 12px;

    color: ${props => props.theme.text};
`
const Content = styled('div')`
    display: flex;
    flex-direction: column;
    background-color: ${props => props.theme.background.default};
    white-space: pre-wrap;
    overflow: hidden;
    border-radius: 8px;
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
            {children ? <Content style={_contentStyle}>
                {children}
            </Content> : null}
        </Container>
    )
}

Panel.Left = styled('div')`
    display: flex;
    flex-direction: column;
    flex: 1;
`

Panel.Right = styled('div')`
    display: flex;
    flex-direction: column;
    flex: 2;
    padding: 14px;
    border-left: 1px solid ${props => props.theme.border};
`


export const StaticRow = styled(motion.div)`
    display: flex;
    flex-direction: row;
    align-items: center;

    padding: 4px;
    padding-left: 10px;
    margin-top: -1px;
    background-color: ${props => props.selected ? props.theme.background.highlight : 'transparent' };

    @media only screen and (min-width: ${props => props.theme.breakpoints.large}px) {
        padding: 6px;
        padding-left: 12px;
    }
`

export const LinkRow = styled(Link)`
    display: flex;
    flex-direction: row;
    align-items: center;

    padding: 4px;
    padding-left: 10px;

    margin-top: -1px;

    color: ${props => props.theme.text};
    text-decoration: none;
    cursor: pointer;
    background-color: ${props => props.selected ? props.theme.background.highlight : 'transparent' };

    &:hover {
        background-color: ${props => props.theme.background.highlight};
    }

    @media only screen and (min-width: ${props => props.theme.breakpoints.large}px) {
        padding: 6px;
        padding-left: 12px;
    }
`

export const ClickRow = styled(motion.div)`
    display: flex;
    flex-direction: row;
    align-items: center;

    padding: 4px;
    padding-left: 10px;
    margin-top: -1px;

    color: ${props => props.theme.text};
    text-decoration: none;
    cursor: pointer;
    background-color: ${props => props.selected ? props.theme.background.highlight : 'transparent' };

    &:hover {
        background-color: ${props => props.theme.background.highlight};
    }

    @media only screen and (min-width: ${props => props.theme.breakpoints.large}px) {
        padding: 6px;
        padding-left: 12px;
    }
`

export function BaseRow({ to, onClick, ...props }) {
    if (to) {
        return <LinkRow to={to} {...props}/>
    } else if (onClick) {
        return <ClickRow onClick={onClick} {...props}/>
    } else {
        return <StaticRow {...props}/>
    }
}

export const Row = styled(BaseRow)`
    border-bottom: 0px solid ${props => props.theme.border};
    border-top: 1px solid ${props => props.theme.border};
`