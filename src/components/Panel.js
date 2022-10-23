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
    background-color: #fafafa;
    border: 1px solid #ebebeb;
    border-radius: 12px;
    overflow: hidden;
`

const Header = styled('div')`
    display: flex;
    flex-direction: row;
    font-weight: bold;
    font-size: 20px;
    padding: 8px;
    padding-left: 12px;
`

export default function Panel({ title, children, spacing, contentStyle = {} }) {
    const _contentStyle = {...contentStyle, ...(spacing ? { padding: 12 } : {}) }
    return (
        <Container>
            <Header>{title}</Header>
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
    padding: 3px;
    padding-left: 10px;
    margin-bottom: -1px;
`

export const LinkRow = styled(Link)`
    display: flex;
    flex-direction: row;
    align-items: center;

    border-bottom: 1px solid #ebebeb;
    border-top: 1px solid transparent;
    padding: 3px;
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