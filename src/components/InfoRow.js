import { styled } from 'goober'
import { Row } from './Panel'

const Title = styled('div')`
    font-size: 15px;
    margin-top: -1px;
`

const Subtitle = styled('div')`
    font-size: 10px;
    color: gray;
`

const TextContainer = styled('div')`
    display: flex;
    flex-direction: column;
    margin-left: 8px;
    padding: 4px;
`

const Right = styled('div')`
    margin-right: 6px;
    margin-bottom: -4px;
    font-size: 12px;
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
`


export default function InfoRow({ to, icon, title, subtitle, right }) {
    const IconComponent = icon
    return (
        <Row to={to}>
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
