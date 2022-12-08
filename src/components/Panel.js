import { styled } from 'goober'
import { Link } from 'react-router-dom'
import colors from '../colors'

const Container = styled('div')`
    display: flex;
    flex-direction: column;
    padding-bottom: 12px;
    padding-left: 0px;
    padding-right: 14px;
    margin-bottom: 12px;
    margin-right: 22px;
    min-width: 400px;
`
const Content = styled('div')`
    display: flex;
    flex-direction: column;
    background-color: white;
    
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid ${colors.border.normal};
    box-shadow: 0px 2px 3px rgba(22, 22, 26, 0.05);
`


const Header = styled('div')`
    display: flex;
    flex-direction: row;
    font-weight: bold;
    font-size: 20px;
    padding: 8px;
    padding-left: 12px;
`

export default function Panel({ header, children, spacing, contentStyle = {}, ...props }) {
    const _contentStyle = {...contentStyle, ...(spacing ? { padding: 14 } : {}) }
    return (
        <Container {...props}>
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

    border-bottom: 1px solid #ebebeb;
    padding: 4px;
    padding-left: 10px;
    margin-bottom: -1px;
`

export const LinkRow = styled(Link)`
    display: flex;
    flex-direction: row;
    align-items: center;

    border-bottom: 1px solid #ebebeb;
    border-top: 1px solid transparent;
    padding: 4px;
    padding-left: 10px;
    margin-bottom: -1px;

    color: inherit;
    text-decoration: none;
    cursor: pointer;

    &:hover {
        border-top: 1px solid #ebebeb;
        background-color: ${colors.neutral.highlight};
    }
`

export function Row({ to, ...props }) {
    const Component = to ? LinkRow : StaticRow
    return <Component to={to} {...props} />
}