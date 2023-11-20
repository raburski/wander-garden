import { styled } from "goober"
import countryFlagEmoji from "country-flag-emoji"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"

const CountryPanelContainer = styled('div')`
    position: relative;
    width: 182px;
    height: 182px;
    border-radius: 8px;
    border: 1px solid ${props => props.theme.border};

    overflow: hidden;
    margin-bottom: 10px;
`

const CountryPanelBackground = styled(motion.div)`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 10px;
    background-size: cover;
    background-position: center;
`

const Flag = styled('div')`
    position: absolute;
    font-size: 48px;
    padding-left: 12px;
`

const backgroundVariants = {
    rest: {},
    hover: { opacity: 0.9 },
}

function CountryPanel({ code }) {
    const country = countryFlagEmoji.get(code)
    return (
        <CountryPanelContainer>
            <CountryPanelBackground style={{
                backgroundImage: `url(/photos/${code.toLowerCase()}.png)`,
            }} variants={backgroundVariants}/>
            <Flag>{country.emoji}</Flag>
        </CountryPanelContainer>
    )
}

const MotionLink = motion(Link)

const Container = styled(MotionLink)`
    position: relative;
    display: flex;
    flex-direction: row;
    margin-right: 32px;
    margin-bottom: 32px;
    max-width: 100%;

    box-shadow: 0px 2px 3px ${props => props.theme.shadow};
    border-radius: 8px;
`

const Bottom = styled('div')`
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: center;
    bottom: 0px;
    left: 0px;
    padding: 8px;
    right: 0px;
    
    color: ${props => props.theme.text};
    border-radius: 0px 0px 8px 8px;

    background-color: ${props => props.theme.background.default};
    border-right: 1px solid ${props => props.theme.border};
    border-left: 1px solid ${props => props.theme.border};
    border-bottom: 1px solid ${props => props.theme.border};
`

const Title = styled('div')`
    font-size: 18px;
    font-family: Primary;
`

const Subtitle = styled('div')`
    padding-top: 4px;
    font-size: 11px;
`

const containerVariants = {
    rest: {},
    hover: { scale: 1.02, transition: { ease: "easeOut", duration: 0.2 } }
}

export default function TripPanel({ title, subtitle, countryCodes, days, range, children, ...props }) {
    return (
        <Container initial="rest" whileHover="hover" animate="rest" variants={containerVariants} {...props}>
            {countryCodes.map(code => <CountryPanel code={code} />)}
            <Bottom>
                <Title>{title}</Title>
                {subtitle ? <Subtitle>{subtitle}</Subtitle> : null}
                <Subtitle>{days}, {range}</Subtitle>
            </Bottom>
        </Container>
    )
}