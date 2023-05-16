import { styled } from 'goober'
import { Row } from './Panel'

const FlagIcon = styled('div')`
    display: flex;
    flex: 0;
    align-self: start;
`

const CountryName = styled('div')`
    font-size: 14px;
    margin-left: 8px;
    margin-top: -1px;
    color: ${props => props.theme.text};

    @media only screen and (min-width: ${props => props.theme.breakpoints.large}px) {
        margin-left: 12px;
    }
`

const Right = styled('div')`
    margin-right: 6px;
    margin-bottom: -4px;
    color: ${props => props.theme.text};
`

const Stretch = styled('div')`
    display: flex;
    flex: 1;
`

export default function EmojiRow({ emoji, value, to, right }) {
    return <Row to={to}><FlagIcon>{emoji}</FlagIcon> <CountryName>{value}</CountryName><Stretch/>{right ? <Right>{right}</Right> : null}</Row>
}
