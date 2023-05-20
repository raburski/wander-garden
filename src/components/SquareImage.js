import { styled } from "goober"

const SquareImage = styled('img')`
    display: flex;
    width: ${props => props.size || 150}px;
    height: ${props => props.size || 150}px;
`

export default SquareImage

export const ResponsiveSquareImage = styled(SquareImage)`
    @media only screen and (max-width: ${props => props.theme.breakpoints.large}px) {
        width: ${props => props.mediumSize || 60}px;
        height: ${props => props.mediumSize || 60}px;
    }

    @media only screen and (max-width: ${props => props.theme.breakpoints.medium}px) {
        width: ${props => props.smallSize || 40}px;
        height: ${props => props.smallSize || 40}px;
    }

    @media only screen and (max-width: ${props => props.theme.breakpoints.small}px) {
        width: 20px;
        height: 20px;
    }
`