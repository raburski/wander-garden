import { styled } from 'goober'
import { VscDashboard, VscPulse, VscVersions } from 'react-icons/vsc'
import { FaDiscord, FaTwitter } from 'react-icons/fa'
import { TfiMapAlt } from 'react-icons/tfi'
import { SiSwarm } from 'react-icons/si'
import { SlPuzzle, SlSettings } from 'react-icons/sl'
import { BsAward } from 'react-icons/bs'
import { RxFileText } from 'react-icons/rx'
import Logo from './Logo'
import StylelessLink from 'components/StylelessLink'
import PillLink from 'components/PillLink'

const Container = styled('div')`
    display: flex;
    flex: 0;
    flex-direction: column;
    padding: 12px;
    flex-basis: 192px;

    @media (pointer:none), (pointer:coarse) {
        display: none;
    }
`

const Separator = styled('div')`
    height: 24px;
    width: 24px;
`

const SpreadSeparator = styled('div')`
    flex: 1;
`

const MountainImg = styled('img')`
    width: 42px;
    height: 42px;
    margin-left: -8px;
    margin-bottom: -8px;
    opacity: 0.8;
`

function MountainSeparator() {
    return (
        <div>
            <MountainImg src="/mountain/1.svg" />
            <MountainImg src="/mountain/4.svg" />
            <MountainImg src="/mountain/3.svg" />
            <MountainImg src="/mountain/2.svg" />
            <MountainImg src="/mountain/3.svg" />
        </div>
    )
}


const StyledNotes = styled('div')`
  font-size: 11px;
  color: ${props => props.theme.text};
  align-self: center;
  text-align: center;

`

const StyledPillLink = styled(PillLink)`
    margin-left: 12px;
`

const SubButtons = styled('div')`
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin: 8px;
`


const DISCORD_URL = 'https://discord.gg/BhyXtRH6'
const TWITTER_LINK = 'https://twitter.com/wandergarden_'
function SubNotes() {
    const openDiscord = () => window.open(DISCORD_URL, '_blank')
    const openTwitter = () => window.open(TWITTER_LINK, '_blank')
    return (
        <StyledNotes>
            
            <SubButtons>
                <PillLink small icon={FaDiscord} onClick={openDiscord}/>
                <PillLink small icon={FaTwitter} onClick={openTwitter}/>
            </SubButtons>
            <StylelessLink to="/info">What is Wander Garden?</StylelessLink>
            <MountainSeparator />
        </StyledNotes>
    )
}

export default function SideBar() {
    return (
        <Container>
            <StylelessLink to="dashboard"><Logo /></StylelessLink>
            <Separator />
            <StyledPillLink to="/" icon={VscDashboard}>Dashboard</StyledPillLink>
            <StyledPillLink to="timeline" icon={VscVersions}>Timeline</StyledPillLink>
            <StyledPillLink to="badges" icon={BsAward}>Badges</StyledPillLink>
            <StyledPillLink to="context" icon={VscPulse}>Context</StyledPillLink>
            <StyledPillLink to="map" icon={TfiMapAlt}>Map</StyledPillLink>
            <StyledPillLink to="data" icon={RxFileText}>Data</StyledPillLink>
            <Separator />
            <StyledPillLink to="swarm" icon={SiSwarm}>Swarm</StyledPillLink>
            <StyledPillLink to="extension" icon={SlPuzzle}>Extension</StyledPillLink>
            <Separator />
            <StyledPillLink to="settings" icon={SlSettings}>Settings</StyledPillLink>
            <SpreadSeparator />
            <SubNotes />
        </Container>
    )
}