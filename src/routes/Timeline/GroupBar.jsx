import countryFlagEmoji from "country-flag-emoji"
import { styled } from 'goober'
import colors from "../../colors"

const Container = styled('div')`
    background-color: #ebf2ee;
    margin-bottom: -1px;
    border-bottom: 1px solid ${colors.border.normal};

`

const Header = styled('div')`
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-left: 12px;
`

const FirstFlag = styled('div')`
    font-size: 32px;
`

const NextFlag = styled('div')`
    font-size: 32px;
    margin-left: -4px;
`

const Title = styled('div')`
    font-size: 18px;
    font-weight: bold;
    margin-right: 24px;
    margin-left: 12px;
`

const States = styled('div')`
    font-size: 32px;
    margin-right: 12px;
    font-size: 14px;
    color: #4f4f4f;
`

const Icons = styled('div')`
    display: flex;
    flex-direction: row;
    margin-left: 46px;
    margin-bottom: 12px;
`

const StyledIcon = styled('div')`
    font-size: 16px;
    margin-right: 2px;
    cursor: default;
`

export default function GroupBar({ countryCodes = [], title }) {
    const flags = countryCodes.map(code => countryFlagEmoji.get(code)?.emoji).filter(Boolean).map((emoji, index) => {
        if (index == 0) {
            return <FirstFlag>{emoji}</FirstFlag>
        } else {
            return <NextFlag>{emoji}</NextFlag>
        }
    })

    return (
        <Container>
            <Header>{flags}<Title>{title}</Title></Header>
        </Container>
    )
}