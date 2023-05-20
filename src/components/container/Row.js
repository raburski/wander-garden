import { styled } from 'goober'

export default styled('div')`
    display: flex;
    flex-direction: row;

    @media only screen and (max-width: ${props => props.theme.breakpoints.small}px) {
        flex-direction: column;
    }
`
