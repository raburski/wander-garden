import { styled } from "goober"
import countryFlagEmoji from "country-flag-emoji"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Row } from "components/container"

const CountryPanelContainer = styled('div')`
    position: relative;
    width: 74px;
    height: 62px;
`

const Flag = styled('div')`
    font-size: 48px;
    padding-left: 12px;
`

function CountryPanel({ code }) {
    const country = countryFlagEmoji.get(code)
    return (
        <CountryPanelContainer>
            <Flag>{country.emoji}</Flag>
        </CountryPanelContainer>
    )
}

const MotionLink = motion(Link)

const Container = styled(MotionLink)`
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-right: 24px;
    margin-bottom: 24px;
    max-width: 100%;
    min-width: 182px;
    text-decoration: none;

    box-shadow: 0px 2px 3px ${props => props.theme.shadow};
    border-radius: 8px;
    border: 1px solid ${props => props.theme.border};

    transition: 0.2s;
    background-color: ${props => props.theme.background.default};
    &:hover {
        background-color: ${props => props.theme.background.highlight};
    }

`

const Bottom = styled('div')`

    display: flex;
    flex-direction: column;
    justify-content: center;

    padding-left: 8px;
    padding-right: 8px;
    padding-bottom: 8px;

    
    color: ${props => props.theme.text};
    border-radius: 0px 0px 8px 8px;
`

const Title = styled('div')`
    font-size: 18px;
    font-family: Primary;
`

const Subtitle = styled('div')`
    padding-top: 4px;
    font-size: 11px;
`

export default function TripPanel({ title, subtitle, countryCodes, days, range, children, ...props }) {
    return (
        <Container {...props}>
            <Row>
                {countryCodes.map(code => <CountryPanel key={code} code={code} />)}
            </Row>
            <Bottom>
                <Title>{title}</Title>
                {subtitle ? <Subtitle>{subtitle}</Subtitle> : null}
                <Subtitle>{days}, {range}</Subtitle>
            </Bottom>
        </Container>
    )
}