import countryFlagEmoji from "country-flag-emoji"
import ContentRow from "components/ContentRow"
import { styled } from 'goober'

const FirstFlag = styled('div')`
    font-size: 28px;
`

const NextFlag = styled('div')`
    font-size: 28px;
    margin-left: -2px;
`

const UNDEFINED_FLAG = '❓'

export default function GroupBar({ countryCodes = [], to, title, subtitle, onClick, days, range, onMoreClick, ...props }) {
    const flags = countryCodes.map((code) => code === undefined ? UNDEFINED_FLAG : countryFlagEmoji.get(code)?.emoji).filter(Boolean).map((emoji, index) => {
        if (index == 0) {
            return <FirstFlag key={countryCodes[index]}>{emoji}</FirstFlag>
        } else {
            return <NextFlag key={countryCodes[index]}>{emoji}</NextFlag>
        }
    })

    return (
        <ContentRow
            onClick={onClick}
            to={to}
            left={flags}
            title={title}
            subtitle={subtitle}
            rightText={days}
            rightSubText={range}
            onMoreClick={onMoreClick}
            {...props}
        />
    )
}