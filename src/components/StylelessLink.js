import { styled } from "goober"
import { Link } from "react-router-dom"

export default styled(Link)`
    text-decoration: none;
    color: ${props => props.theme.text};
`