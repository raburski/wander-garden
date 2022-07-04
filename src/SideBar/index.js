import { styled } from 'goober'
import { Link, useResolvedPath, useMatch } from 'react-router-dom'
import { VscDashboard, VscCloudUpload, VscCloudDownload } from 'react-icons/vsc'
import { SiSwarm, SiNetflix } from 'react-icons/si'
import Logo from './Logo'
import colors from '../colors'

const Container = styled('div')`
    display: flex;
    flex: 0;
    flex-direction: column;
    padding: 12px;
    flex-basis: 212px;
    border-right: 1px solid ${colors.border.light};
    background-color: ${colors.neutral.light};
`
const Separator = styled('div')`
    height: 32px;
`

const SpreadSeparator = styled('div')`
    flex: 1;
`

const TextSeparator = styled('div')`
    height: 28px;
    padding-left: 20px;
    margin-top: 18px;
    text-decoration: none;
    color: black;
    font-family: Courier;
    font-size: 16px;
    font-weight: bold;
`

const StyledLink = styled(Link)`
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 1px;
    padding: 6px;
    padding-left: 18px;
    padding-right: 22px;
    border-radius: 26px;
    text-decoration: none;
    color: black;
    font-family: Courier;
    font-size: 16px;

    &:hover {
        background-color: ${colors.neutral.normal};
    }
    &:active {
        background-color: ${colors.neutral.dark};
    }
`

const LinkIcon = styled('div')`
    margin-right: 8px;
    margin-top: 6px;
    font-size: 22px;
`

function PillLink({ icon, children, to, ...props }) {
    const resolved = useResolvedPath(to)
    const match = useMatch({ path: resolved.pathname + '/*' })
    const PillIcon = icon
  
    return (
        <StyledLink
          style={match ? { backgroundColor: colors.neutral.normal } : {}}
          to={to}
          {...props}
        >
            {PillIcon ? <LinkIcon><PillIcon /></LinkIcon> : null}{children}
        </StyledLink>
    )
}

const StylelessLink = styled(Link)`
    align-self: center;
    text-decoration: none;
    display: flex;
`

const StyledNotes = styled('div')`
  font-size: 10px;
  color: ${colors.neutral.dark};
  align-self: center;
  text-align: center;
  margin-top: 22px;
`

function SubNotes() {
    return (
        <StyledNotes>
            Stópki
        </StyledNotes>
    )
}

export default function SideBar() {
    return (
        <Container>
            <StylelessLink to="dashboard"><Logo /></StylelessLink>
            <Separator />
            <PillLink to="timeline" icon={VscDashboard}>Timeline</PillLink>
            <PillLink to="context" icon={VscDashboard}>Context</PillLink>
            <PillLink to="events" icon={VscCloudUpload}>Events</PillLink>
            <Separator />
            <TextSeparator>Sources</TextSeparator>
            <PillLink to="swarm" icon={SiSwarm}>Swarm</PillLink>
            <PillLink to="netflix" icon={SiNetflix}>Netflix</PillLink>
            <SpreadSeparator />
            <SubNotes />
        </Container>
    )
}