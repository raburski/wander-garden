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

    @media only screen and (max-width: ${props => props.theme.breakpoints.small}px) {
        margin-right: 0px;
        margin-left: 0px;
    }
`

const Title = styled('div')`
    font-weight: bold;
    font-size: 18px;
    color: ${props => props.theme.text};
`

const Text = styled('div')``
const ImageContainer = styled('div')`
    display: flex;
    @media only screen and (max-width: ${props => props.theme.breakpoints.small}px) {
        display: none;
    }
`

const DynamicSeparator = styled(Separator)`
    @media only screen and (max-width: ${props => props.theme.breakpoints.small}px) {
        display: none;
    }
`

const CONTENT_STYLE = { flexDirection: 'row' }

export default function InfoPanel({ image, title, text, children, containerStyle, imageStyle, ...props }) {
    return (
        <Panel contentStyle={CONTENT_STYLE} {...props}>
            <ImageContainer style={imageStyle}>{image}</ImageContainer>
            <Container style={containerStyle}>
                <Title>{title}</Title>
                {title && (text || children) ? <DynamicSeparator /> : null}
                <Text>{text}</Text>
                {children}
            </Container>
        </Panel>
    )
}