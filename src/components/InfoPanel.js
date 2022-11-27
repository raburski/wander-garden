import { styled } from 'goober'
import Panel from './Panel'

const TextContainer = styled('div')`
    display: flex;
    flex-flow: column;
    align-self: stretch;
    justify-content: center;
    margin-right: 42px;
    margin-left: 22px;
`

const Title = styled('div')`
    font-weight: bold;
    font-size: 18px;
`

const Text = styled('div')``
const Separator = styled('div')`
    height: 16px;
`

const contentStyle = {flexDirection: 'row'}

export default function InfoPanel({ image, title, text, children, ...props }) {
    return (
        <Panel contentStyle={contentStyle} {...props}>
            {image}
            <TextContainer>
                <Title>{title}</Title>
                {title && (text || children) ? <Separator /> : null}
                <Text>{text}</Text>
                {children}
            </TextContainer>
        </Panel>
    )
}