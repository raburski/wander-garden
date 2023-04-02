import { styled } from "goober"
import countryFlagEmoji from "country-flag-emoji"
import { useHomes } from 'domain/homes'
import Panel from '../../components/Panel'
import NoneFound from '../../components/NoneFound'

const HomeContainer = styled('div')`
    display: flex;
    flex-direction: row;
    align-items: center;
    border-bottom: 1px solid ${props => props.theme.border};
    padding: 10px;
    padding-left: 14px;
    margin-bottom: -1px;
`

const HomeName = styled('div')`
    font-weight: bold;
    color: ${props => props.theme.text};
`

const HomeState = styled('div')`
    flex: 1;
    font-size: 32px;
    margin-left: 12px;
    font-size: 14px;
    color: #4f4f4f;
`

const HomeDates = styled('div')`
    font-size: 32px;
    margin-left: 12px;
    font-size: 14px;
    color: #4f4f4f;
    margin-right: 12px;
`

const DEFAULT_FLAG = '🏳️'
function Home({ home }) {
    const locationParts = [home.location.state, home.location.country].filter(Boolean)
    const flag = countryFlagEmoji.get(home.location.cc)
    return (
        <HomeContainer>
            <HomeName>{flag ? flag.emoji : DEFAULT_FLAG}&nbsp;&nbsp;&nbsp;{home.location.city}</HomeName>
            <HomeState>{locationParts.join(', ')}</HomeState>
            <HomeDates>{home.since} {home.since ? '-' : 'until'} {home.until || 'now'}</HomeDates>
        </HomeContainer>
    )
}

export default function PotentialHomesView() {
    const [potentialHomes] = useHomes()
    const header = `You have lived in ${potentialHomes.length} places`
    return (
        <Panel header={header}>
            {potentialHomes.length > 0 ? potentialHomes.map(home => <Home home={home} />) : <NoneFound />}
        </Panel>
    )
}