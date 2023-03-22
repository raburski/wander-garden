import { styled } from 'goober'
import { VscDashboard, VscPulse, VscVersions } from 'react-icons/vsc'
import { TfiMapAlt } from 'react-icons/tfi'
import { SiSwarm } from 'react-icons/si'
import { SlPuzzle } from 'react-icons/sl'
import { BsAward } from 'react-icons/bs'
import { RxFileText } from 'react-icons/rx'
import Logo from './Logo'
import colors from '../colors'
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
`

const SpreadSeparator = styled('div')`
    flex: 1;
`

const TextSeparator = styled('div')`
    height: 28px;
    padding-left: 28px;
    margin-top: 18px;
    text-decoration: none;
    color: black;
    font-family: "Courier Prime";
    font-size: 16px;
    font-weight: bold;
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
  color: ${colors.neutral.dark};
  align-self: center;
  text-align: center;
  margin-top: 22px;
`

const StyledPillLink = styled(PillLink)`
    margin-left: 12px;
`

function SubNotes() {
    return (
        <StyledNotes>
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
            <TextSeparator>Sources</TextSeparator>
            <StyledPillLink to="swarm" icon={SiSwarm}>Swarm</StyledPillLink>
            <StyledPillLink to="extension" icon={SlPuzzle}>Extension</StyledPillLink>
            {/* <PillLink to="phone" icon={VscDeviceMobile}>Phone</PillLink> */}
            {/* <PillLink to="netflix" icon={SiNetflix}>Netflix</PillLink> */}
            <SpreadSeparator />
            <SubNotes />
        </Container>
    )
}