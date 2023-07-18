import PinButton from "components/PinButton"
import { styled } from 'goober'
import { Row } from "components/Panel"
import { TbDotsVertical } from 'react-icons/tb'

const TitleContent = styled('div')`
    display: flex;
    flex: 1;
    flex-direction: column;
    margin-right: 24px;
    margin-left: 12px;
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
    margn-top: 4px;
    margn-bottom: 4px;
    align-items: flex-end;
    min-width: 90px;
`

const Days = styled('div')`
    font-size: 16px;
    margin-bottom: 2px;
`

const Range = styled('div')`
    font-size: 10px;
`

export default function ContentRow({ left, image, to, title, subtitle, onClick, rightText, rightSubText, range, onMoreClick, ...props }) {
    return (
        <Row onClick={onClick} to={to} {...props}>
            {left}
            {image}
            <TitleContent>
                <Title>{title}</Title>
                {subtitle ? <Subtitle>{subtitle}</Subtitle> : null}
            </TitleContent>
            <RightContent>
                <Days>{rightText}</Days>
                <Range>{rightSubText}</Range>
            </RightContent>
            {onMoreClick ?
                <ActionsContent>
                    <PinButton icon={TbDotsVertical} onClick={onMoreClick}/>
                </ActionsContent>
            : null }
        </Row>
    )
}