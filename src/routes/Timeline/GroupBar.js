import PinButton from "components/PinButton"
import countryFlagEmoji from "country-flag-emoji"
import { styled } from 'goober'
import colors from "../../colors"
import { Row } from "../../components/Panel"
import { TbDotsVertical } from 'react-icons/tb'

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
    color: ${props => props.theme.text};
`

const Subtitle = styled('div')`
    display: flex;
    flex: 1;
    font-size: 11px;
    margin-bottom: 2px;
    color: ${props => props.theme.text};
`

const ActionsContent = styled('div')`
    display: flex;
    flex-direction: row;
    margin-right: 12px;
    align-items: flex-end;
`

const RightContent = styled('div')`
    display: flex;
    flex-direction: column;
    margin-right: 12px;
    align-items: flex-end;
    min-width: 90px;
`

const Days = styled('div')`
    font-size: 16px;
    margin-bottom: 2px;
`

const Range = styled('div')`
    font-size: 10px;
    margin-bottom: 4px;
`

export default function GroupBar({ countryCodes = [], to, title, subtitle, onClick, days, range, onMoreClick }) {
    const flags = countryCodes.map((code) => countryFlagEmoji.get(code)?.emoji).filter(Boolean).map((emoji, index) => {
        if (index == 0) {
            return <FirstFlag key={countryCodes[index]}>{emoji}</FirstFlag>
        } else {
            return <NextFlag key={countryCodes[index]}>{emoji}</NextFlag>
        }
    })

    return (
        <Row onClick={onClick} to={to}>
            {flags}
            <TitleContent>
                <Title>{title}</Title>
                {subtitle ? <Subtitle>{subtitle}</Subtitle> : null}
            </TitleContent>
            <RightContent>
                <Days>{days}</Days>
                <Range>{range}</Range>
            </RightContent>
            {onMoreClick ?
                <ActionsContent>
                    <PinButton icon={TbDotsVertical} onClick={onMoreClick}/>
                </ActionsContent>
            : null }
        </Row>
    )
}