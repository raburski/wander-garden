import { styled } from "goober"

export default styled('h1')`
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    border-bottom: 3px solid #4fa177;
    font-size: 38px;
    line-height: 37px;
    font-weight: 800;
    font-family: Header;
    padding-left: 2px;
    padding-bottom: 4px;
    margin-bottom: 18px;
    margin-top: -4px;
    color: ${props => props.theme.text};

    @media only screen and (max-width: ${props => props.theme.breakpoints.small}px) {
        justify-content: center;
    }
`
