import { styled } from 'goober'
import { Row } from './Panel'

const FlagIcon = styled('div')`
    display: flex;
    flex: 0;
    align-self: center;
`

const CountryName = styled('div')`
    font-size: 14px;
    margin-top: 4px;
    margin-bottom: 5px;
    margin-left: 8px;

    color: ${props => props.theme.text};

    @media only screen and (min-width: ${props => props.theme.breakpoints.large}px) {
        margin-left: 12px;
    }
`

const Right = styled('div')`
    margin-right: 6px;
    margin-bottom: -4px;
    margin-top: -4px;
    font-size: 14px;
    color: ${props => props.theme.text};
`

const Stretch = styled('div')`
    display: flex;
    flex: 1;
`

export default function EmojiRow({ emoji, value, to, right, emojiStyle, ...props }) {
    return <Row to={to} {...props}><FlagIcon style={emojiStyle}>{emoji}</FlagIcon> <CountryName>{value}</CountryName><Stretch/>{right ? <Right>{right}</Right> : null}</Row>
}
