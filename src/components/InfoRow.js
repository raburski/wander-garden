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
    padding-top: 2px;

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
    display: flex;
    align-items: center;
    margin-right: 6px;

    font-size: 14px;
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


export default function InfoRow({ to, onClick, icon, title, subtitle, right, rightStyle, selected, iconSize = 16, children, ...props }) {
    const IconComponent = icon
    return (
        <Row to={to} onClick={onClick} selected={selected} {...props}>
            {icon ? <IconContainer><IconComponent size={iconSize} /></IconContainer> : null}
            <TextContainer>
                <Title>{title}</Title>
                <Subtitle>{subtitle}</Subtitle>
            </TextContainer>
            {children}
            <Stretch/>
            {right ? <Right style={rightStyle}>{right}</Right> : null}
        </Row>
    )
}
