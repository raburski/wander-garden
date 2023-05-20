import { styled } from "goober"

export default styled('div')`

    @media only screen and (min-width: ${props => props.theme.breakpoints.large}px) {
        height: 24px;
        width: 24px;
    }

    @media only screen and (min-width: ${props => props.theme.breakpoints.medium}px) and (max-width: ${props => props.theme.breakpoints.large}px) {
        height: 18px;
        width: 18px;
    }
    
    @media only screen and (min-width: ${props => props.theme.breakpoints.small}px) and (max-width: ${props => props.theme.breakpoints.medium}px) {
        height: 14px;
        width: 14px;
    }
    
    @media only screen and (max-width: ${props => props.theme.breakpoints.small}px) {
        height: 8px;
        width: 8px;
    }
`