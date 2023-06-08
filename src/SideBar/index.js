import { styled, css } from 'goober'
import { VscDashboard, VscPulse, VscVersions } from 'react-icons/vsc'
import { FaDiscord, FaTwitter } from 'react-icons/fa'
import { TfiMapAlt, TfiMenu } from 'react-icons/tfi'
import { SiSwarm } from 'react-icons/si'
import { SlPuzzle, SlSettings } from 'react-icons/sl'
import { BsAward } from 'react-icons/bs'
import { RxFileText } from 'react-icons/rx'
import Logo from './Logo'
import StylelessLink from 'components/StylelessLink'
import PillLink from 'components/PillLink'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Button from 'components/Button'
import { isDEV } from 'environment'

const hideOnMediumBreakpointClassName = css`
@media only screen and (min-width: 574px) and (max-width: 1024px) {
    display: none;
}`

const Container = styled(motion.div)`
    display: flex;
    flex: 0;
    flex-direction: column;
    padding: 12px;
    flex-basis: 192px;
    background-color: ${props => props.theme.background.default};

    @media only screen and (min-width: ${props => props.theme.breakpoints.large}px) {
        flex-basis: 222px;
        padding-left: 24px;
        padding-right: 24px;
        padding-top: 24px;
    }

    @media only screen and (max-width: ${props => props.theme.breakpoints.large}px) {
        flex-basis: 0px;
        padding-left: 24px;
        padding-right: 24px;
    }

    @media only screen and (max-width: ${props => props.theme.breakpoints.small}px) {
        display: block;
        position: fixed;

        height: 100%;
        box-shadow: 0px 2px 10px ${props => props.theme.shadow};
        z-index: 4;
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

    @media only screen and (max-width: ${props => props.theme.breakpoints.medium}px) {
        display: none;
    }
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
    @media only screen and (min-width: ${props => props.theme.breakpoints.small}px) and (max-width: ${props => props.theme.breakpoints.medium}px) {
        font-size: 0px;
        margin-left: 2px;
        padding-left: 20px;
    }
`

const SubButtons = styled('div')`
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: center;
    margin: 8px;
`


const DISCORD_URL = 'https://discord.gg/BhyXtRH6'
const TWITTER_LINK = 'https://twitter.com/wandergarden_'
function SubNotes({ onLinkClick }) {
    const openDiscord = () => window.open(DISCORD_URL, '_blank')
    const openTwitter = () => window.open(TWITTER_LINK, '_blank')
    return (
        <StyledNotes>
            <SubButtons>
                <PillLink small icon={FaDiscord} onClick={openDiscord}/>
                <PillLink small icon={FaTwitter} onClick={openTwitter}/>
            </SubButtons>
            <StylelessLink onClick={onLinkClick} to="/info">What is Wander Garden?</StylelessLink>
            <MountainSeparator />
        </StyledNotes>
    )
}

const HamburgerButton = styled(Button)`
    position: absolute;
    margin: 12px;
    z-index: 3;
    @media only screen and (min-width: ${props => props.theme.breakpoints.small}px) {
        display: none;
    }
`

function HamburgerMenu({ onClick }) {
    return <HamburgerButton onClick={onClick} icon={TfiMenu} />
}

const CLOSED_SIDEBAR_STYLE = { marginLeft: -200}

function SideMenu({ onLinkClick, ...props }) {
    return (
        <Container {...props}>
            <StylelessLink onClick={onLinkClick} to="dashboard"><Logo /></StylelessLink>
            <Separator />
            <StyledPillLink onClick={onLinkClick} to="/" separatorClassName={hideOnMediumBreakpointClassName} icon={VscDashboard}>Dashboard</StyledPillLink>
            <StyledPillLink onClick={onLinkClick} to="timeline" separatorClassName={hideOnMediumBreakpointClassName} icon={VscVersions}>Timeline</StyledPillLink>
            <StyledPillLink onClick={onLinkClick} to="badges" separatorClassName={hideOnMediumBreakpointClassName} icon={BsAward}>Badges</StyledPillLink>
            {isDEV() ? <StyledPillLink onClick={onLinkClick} to="context" separatorClassName={hideOnMediumBreakpointClassName} icon={VscPulse}>Context</StyledPillLink> : null}
            <StyledPillLink onClick={onLinkClick} to="map" separatorClassName={hideOnMediumBreakpointClassName} icon={TfiMapAlt}>Map</StyledPillLink>
            <StyledPillLink onClick={onLinkClick} to="data" separatorClassName={hideOnMediumBreakpointClassName} icon={RxFileText}>Data</StyledPillLink>
            <Separator />
            <StyledPillLink onClick={onLinkClick} to="swarm" separatorClassName={hideOnMediumBreakpointClassName} icon={SiSwarm}>Swarm</StyledPillLink>
            <StyledPillLink onClick={onLinkClick} to="extension" separatorClassName={hideOnMediumBreakpointClassName} icon={SlPuzzle}>Extension</StyledPillLink>
            <Separator />
            <StyledPillLink onClick={onLinkClick} to="settings" separatorClassName={hideOnMediumBreakpointClassName} icon={SlSettings}>Settings</StyledPillLink>
            <SpreadSeparator />
            <SubNotes onLinkClick={onLinkClick}/>
        </Container>
    )
}

const MobileSideMenu = styled(SideMenu)`
    @media only screen and (min-width: ${props => props.theme.breakpoints.small}px) {
        display: none;
    }
`

const DesktopSideBar = styled(SideMenu)`
    @media only screen and (max-width: ${props => props.theme.breakpoints.small}px) {
        display: none;
    }
`

const MobileSideMenuBackground = styled(motion.div)`
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: rgba(10, 10, 10, 0.3);
    z-index: 2;
`

function MobileSideBar({ openSideBar, hideSideBar, visible }) {
    return (
        <>
        <HamburgerMenu onClick={openSideBar}/>
        <MobileSideMenu onLinkClick={hideSideBar} animate={visible ? {} : CLOSED_SIDEBAR_STYLE}/>
        <AnimatePresence>
            {visible ? <MobileSideMenuBackground initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }} onClick={hideSideBar}/> : null}
        </AnimatePresence>
        </>
    )
}

export default function SideBar() {
    const [visible, setVisible] = useState(false)
    const hideSideBar = () => setVisible(false)
    const openSideBar = () => setVisible(true)

    return (
        <>
            <MobileSideBar hideSideBar={hideSideBar} openSideBar={openSideBar} visible={visible}/>
            <DesktopSideBar onLinkClick={hideSideBar}/>
        </>
    )
}