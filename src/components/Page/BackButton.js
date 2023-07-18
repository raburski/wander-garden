import PillLink from "components/PillLink"
import { styled } from "goober"
import { IoMdArrowRoundBack } from "react-icons/io"

const StyledPillLink = styled(PillLink)`
    margin-bottom: -3px;
    margin-left: -6px;
    margin-right: 4px;
    margin-top: -10px;
    padding: 0px;
    padding-left: 12px;
    padding-right: 12px;
`

export default function BackButton({ onClick }) {
    return <StyledPillLink to={onClick ? undefined: -1} icon={IoMdArrowRoundBack} onClick={onClick}/>
}