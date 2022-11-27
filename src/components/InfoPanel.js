import { styled } from 'goober'
import Panel from './Panel'

const TextContainer = styled('div')`
    display: flex;
    flex-flow: column;
    align-self: stretch;
    justify-content: center;
    margin-right: 42px;
    margin-left: 12px;
`

const Title = styled('div')`
    font-weight: bold;
    font-size: 22px;
`

const Text = styled('div')`
    padding-top: 12px;
`

const contentStyle = {flexDirection: 'row'}

export default function InfoPanel({ image, title, text, ...props }) {
    return (
        <Panel contentStyle={contentStyle} {...props}>
            {image}
            <TextContainer>
                <Title>{title}</Title>
                <Text>{text}</Text>
            </TextContainer>
        </Panel>
    )
}