import PinButton from "components/PinButton"
import { styled } from 'goober'
import { BaseRow } from "../../components/Panel"
import { TbDotsVertical } from 'react-icons/tb'
import { MdOutlineEditNote } from "react-icons/md"
import { motion } from "framer-motion"
import Spacer from "components/Spacer"

const Line = styled(BaseRow)`
    border: 0px solid;
    padding-left: 22px;
    padding-right: 16px;
    align-items: stretch;
`

const TitleContent = styled('div')`
    display: flex;
    flex-direction: column;
    margin-right: 24px;
    margin-left: 12px;
`

const Title = styled('div')`
    display: flex;
    align-items: center;
    flex: 1;
    font-size: 12px;
    font-weight: regular;
    margin-top: 2px;
    margin-bottom: 4px;
    color: ${props => props.theme.text};
`

const ActionsContent = styled(motion.div)`
    display: flex;
    flex-direction: row;
    align-items: flex-end;
`

const Subtitle = styled('div')`
    display: flex;
    flex: 1;
    flex-direction: row;
    margin-top: -3px;
    margin-bottom: 4px;
    margin-right: 12px;
    font-size: 10px;
`

const Note = styled('div')`
    border-radius: 8px;
    background-color: ${props => props.theme.background.default};
    border: 1px solid ${props => props.theme.border};
    padding: 4px;
    padding-left: 8px;
    margin-top: 2px;
    margin-bottom: 2px;
    margin-left: 20px;
    font-size: 12px;
`

const ACTIONS_VARIANTS = {
    rest: { opacity: 0, marginLeft: 20, marginRight: -20 },
    hover: { opacity: 1, marginLeft: 0, marginRight: 0, transition: { ease: "easeOut", duration: 0.1 } },
}

const LineRow = styled('div')`
    display: flex;
    flex: 1;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
`

const LineRowContent = styled('div')`
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: stretch;
`

export default function PhaseLine({ emoji, icon, to, title, subtitle, note, onClick, days, range, onMoreClick, onNoteClick, children, ...props }) {
    const Icon = icon
    return (
        <Line onClick={onClick} initial="rest" whileHover="hover" animate="rest" to={to} {...props}>
            <LineRowContent>
                <LineRow>
                    {icon ? <Icon /> : null}
                    <TitleContent>
                        <Title>{title}</Title>
                        {(days || range) ?
                            <Subtitle>
                                {days}, {range}
                            </Subtitle> 
                        : null}
                        {(subtitle) ?
                            <Subtitle>
                                {subtitle}
                            </Subtitle> 
                        : null}
                    </TitleContent>
                    {children}
                    <Spacer />
                    <ActionsContent variants={ACTIONS_VARIANTS}>
                        {onNoteClick ? <PinButton icon={MdOutlineEditNote} onClick={onNoteClick}/> : null}
                        {onMoreClick ? <PinButton icon={TbDotsVertical} onClick={onMoreClick}/> : null}
                    </ActionsContent>
                </LineRow>
                {note ? <Note>✏️&nbsp;&nbsp;{note}</Note> : null}
            </LineRowContent>
        </Line>
    )
}