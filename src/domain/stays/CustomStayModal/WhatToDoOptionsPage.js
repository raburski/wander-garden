import { MdAddTask, MdAddCircleOutline } from 'react-icons/md'
import { FaUserFriends, FaDiscord, FaPlane } from 'react-icons/fa'
import { FiChevronRight, FiExternalLink } from 'react-icons/fi'
import Panel from "components/Panel"
import MenuRow from "components/MenuRow"
import Page from "components/Page"
import { IoIosHome, IoMdHome } from 'react-icons/io'

export default function WhatToDoOptionsPage({ onAddCustomStay, onStayedAtHome, onAddTransit, onImportFromFriend, onContactUs, onExtendStay, previousPhase, ...props }) {
    return (
        <Page header="What do we do?" {...props}>
            <Panel >
                <MenuRow icon={FaDiscord} onClick={onContactUs} title="Automatic import not working?" subtitle="Let us know on discord" rightIcon={FiExternalLink}/>
                <MenuRow icon={FaUserFriends} onClick={onImportFromFriend} title="Your friend booked this stay?" subtitle="Import their data" rightIcon={FiChevronRight}/>
                {previousPhase && onExtendStay ? <MenuRow icon={MdAddTask} onClick={onExtendStay} title="Stayed longer?" subtitle={`Extend your stay in ${previousPhase.stay.accomodation.name}`} rightIcon={FiChevronRight}/> : null}
                <MenuRow icon={FaPlane} onClick={onAddTransit} title="Slept in transit?" subtitle="Add transport type" rightIcon={FiChevronRight}/>
                <MenuRow icon={IoIosHome} onClick={onStayedAtHome} title="Stayed at home?" subtitle="Split your trip into two" rightIcon={FiChevronRight}/>
                <MenuRow icon={MdAddCircleOutline} onClick={onAddCustomStay} title="Something else?" subtitle="Add custom stay" rightIcon={FiChevronRight}/>
            </Panel>
        </Page>
    )
}