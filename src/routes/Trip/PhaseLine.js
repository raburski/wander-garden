import PinButton from "components/PinButton"
import countryFlagEmoji from "country-flag-emoji"
import { styled } from 'goober'
import colors from "../../colors"
import { Row } from "../../components/Panel"
import { TbDotsVertical } from 'react-icons/tb'

const Line = styled(Row)`
    border: 0px solid;
    padding-left: 26px;
`

const TitleContent = styled('div')`
    display: flex;
    flex-direction: column;
    margin-right: 24px;
    margin-left: 12px;
`

const Emoji = styled('div')`
    font-size: 12px;
`

const Title = styled('div')`
    display: flex;
    flex: 1;
    font-size: 12px;
    font-weight: regular;
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
    flex: 1;
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

export default function PhaseLine({ emoji, icon, to, title, subtitle, onClick, days, range, onMoreClick, children, ...props }) {
    const Icon = icon
    return (
        <Line onClick={onClick} to={to} {...props}>
            {icon ? <Icon /> : null}
            <TitleContent>
                <Title>{title}</Title>
            </TitleContent>
            {children}
            <RightContent>
                <Days>{days}</Days>
                <Range>{range}</Range>
            </RightContent>
            {onMoreClick ?
                <ActionsContent>
                    <PinButton icon={TbDotsVertical} onClick={onMoreClick}/>
                </ActionsContent>
            : null }
        </Line>
    )
}