import PillLink from "components/PillLink"
import { styled } from "goober"
import { IoMdArrowRoundBack } from "react-icons/io"

const StyledPillLink = styled(PillLink)`
    margin-bottom: -3px;
    margin-left: -6px;
    margin-right: 4px;
    margin-top: -8px;
    padding: 4px;
    padding-left: 12px;
    padding-right: 12px;
`

export default function BackButton() {
    return <StyledPillLink to={-1} icon={IoMdArrowRoundBack}/>
}