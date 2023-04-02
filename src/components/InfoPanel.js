import { styled } from 'goober'
import Panel from './Panel'
import Separator from './Separator'

const Container = styled('div')`
    display: flex;
    flex: 1;
    flex-flow: column;
    align-self: stretch;
    justify-content: center;
    margin-right: 42px;
    margin-left: 22px;
    white-space: pre-wrap;
    color: ${props => props.theme.text};
`

const Title = styled('div')`
    font-weight: bold;
    font-size: 18px;
    color: ${props => props.theme.text};
`

const Text = styled('div')``

export default function InfoPanel({ image, title, text, children, containerStyle, contentStyle = {}, ...props }) {
    const _contentStyle = { flexDirection: 'row', ...contentStyle }
    return (
        <Panel contentStyle={_contentStyle} {...props}>
            {image}
            <Container style={containerStyle}>
                <Title>{title}</Title>
                {title && (text || children) ? <Separator /> : null}
                <Text>{text}</Text>
                {children}
            </Container>
        </Panel>
    )
}