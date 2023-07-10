import { styled } from 'goober'
import { Row } from './Panel'

const Title = styled('div')`
    font-size: 15px;
    margin-top: -1px;
    color: ${props => props.theme.text};
`

const Subtitle = styled('div')`
    font-size: 10px;
    color: ${props => props.theme.text};

    @media only screen and (min-width: ${props => props.theme.breakpoints.large}px) {
        padding-top: 2px;
    }
`

const TextContainer = styled('div')`
    display: flex;
    flex-direction: column;
    margin-left: 8px;
    padding: 4px;
    margin-right: 8px;
`

const Right = styled('div')`
    margin-right: 6px;
    margin-bottom: -4px;
    font-size: 12px;
    color: ${props => props.theme.text};
`

const Stretch = styled('div')`
    display: flex;
    flex: 1;
`

const IconContainer = styled('div')`
    display: flex;
    flex: 0;
    align-items: center;
    justify-content: center;
    color: ${props => props.theme.text};
`


export default function InfoRow({ to, onClick, icon, title, subtitle, right, selected }) {
    const IconComponent = icon
    return (
        <Row to={to} onClick={onClick} selected={selected}>
            {icon ? <IconContainer><IconComponent size={16} /></IconContainer> : null}
            <TextContainer>
                <Title>{title}</Title>
                <Subtitle>{subtitle}</Subtitle>
            </TextContainer>
            <Stretch/>
            {right ? <Right>{right}</Right> : null}
        </Row>
    )
}
