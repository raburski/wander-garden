import countryFlagEmoji from "country-flag-emoji"
import { styled } from 'goober'
import colors from "../../colors"
import { Row } from "../../components/Panel"

const TitleContent = styled('div')`
    display: flex;
    flex: 1;
    flex-direction: column;
    margin-right: 24px;
    margin-left: 12px;
`

const FirstFlag = styled('div')`
    font-size: 32px;
`

const NextFlag = styled('div')`
    font-size: 32px;
    margin-left: -2px;
`

const Title = styled('div')`
    display: flex;
    flex: 1;
    font-size: 15px;
    font-weight: bold;
    margin-bottom: 2px;
`

const Subtitle = styled('div')`
    display: flex;
    flex: 1;
    font-size: 11px;
    margin-bottom: 2px;
`

const RightContent = styled('div')`
    display: flex;
    flex-direction: column;
    margin-right: 12px;
    align-items: flex-end;
`

const Days = styled('div')`
    font-size: 16px;
    margin-bottom: 2px;
`

const Range = styled('div')`
    font-size: 10px;
    margin-bottom: 4px;
`

export default function GroupBar({ countryCodes = [], title, subtitle, onClick, days, range }) {
    const flags = countryCodes.map(code => countryFlagEmoji.get(code)?.emoji).filter(Boolean).map((emoji, index) => {
        if (index == 0) {
            return <FirstFlag key={countryCodes[index]}>{emoji}</FirstFlag>
        } else {
            return <NextFlag key={countryCodes[index]}>{emoji}</NextFlag>
        }
    })

    return (
        <Row onClick={onClick}>
            {flags}
            <TitleContent>
                <Title>{title}</Title>
                {subtitle ? <Subtitle>{subtitle}</Subtitle> : null}
            </TitleContent>
            <RightContent>
                <Days>{days}</Days>
                <Range>{range}</Range>
            </RightContent>
        </Row>
    )
}