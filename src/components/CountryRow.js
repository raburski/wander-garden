import { styled } from 'goober'
import { Row } from './Panel'
import countryFlagEmoji from 'country-flag-emoji'


const FlagIcon = styled('div')`
    display: flex;
    flex: 0;
    align-self: start;
`

const CountryName = styled('div')`
    font-size: 14px;
    margin-left: 8px;
    margin-top: -1px;
`

const Right = styled('div')`
    margin-right: 6px;
    margin-bottom: -4px;
`

const Stretch = styled('div')`
    display: flex;
    flex: 1;
`

export default function Country({ code, to, right }) {
    const country = countryFlagEmoji.get(code)
    return <Row to={to}><FlagIcon>{country.emoji}</FlagIcon> <CountryName>{country.name}</CountryName><Stretch/>{right ? <Right>{right}</Right> : null}</Row>
}