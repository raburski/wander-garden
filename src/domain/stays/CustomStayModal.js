import ModalPage from "components/ModalPage"
import { MdHotel, MdSailing, MdAdd } from 'react-icons/md'
import { FaCouch, FaUserFriends, FaCaravan, FaCar, FaShip } from 'react-icons/fa'
import { FiExternalLink } from 'react-icons/fi'
import { TbTent, TbCloudUpload } from 'react-icons/tb'
import { StayPlaceType } from "./types"
import InfoRow from "components/InfoRow"
import Panel from "components/Panel"
import { useState } from "react"
import Button from "components/Button"
import Separator from "components/Separator"
import { useUpload } from "routes/Data/hooks"
import TextField from "components/TextField"

const PlaceTypeToIcon = {
    [StayPlaceType.Accomodation]: MdHotel,
    [StayPlaceType.Campervan]: FaCaravan,
    [StayPlaceType.Camping]: TbTent,
    [StayPlaceType.Car]: FaCar,
    [StayPlaceType.Couchsurfing]: FaCouch,
    [StayPlaceType.Cruiseship]: FaShip,
    [StayPlaceType.Friends]: FaUserFriends,
    [StayPlaceType.Sailboat]: MdSailing,
}

const PlaceTypeToTitle = {
    [StayPlaceType.Accomodation]: 'Accomodation',
    [StayPlaceType.Campervan]: 'Campervan',
    [StayPlaceType.Camping]: 'Camping',
    [StayPlaceType.Car]: 'Car',
    [StayPlaceType.Couchsurfing]: 'Couchsurfing',
    [StayPlaceType.Cruiseship]: 'Cruise Ship',
    [StayPlaceType.Friends]: 'Friends',
    [StayPlaceType.Sailboat]: 'Sailboat',
}

const ICONS = Object.values(PlaceTypeToIcon)

const PREFERRED_COPY_1 = `Automatic import not working?

`

const PREFERRED_COPY_2 = `
Your friend shared file with this stay?

`

const PREFERRED_COPY_3 = `
Otherwise...

`

function AccomodationInfoPanel({ onDismiss }) {
    const onContact = () => window.open('http://raburski.com')
    const uploadFile = useUpload()
    return (
        <>
            {PREFERRED_COPY_1}
            <Button icon={FiExternalLink} onClick={onContact}>Contact us</Button>
            {PREFERRED_COPY_2}
            <Button icon={TbCloudUpload} onClick={uploadFile}>Import from file</Button>
            {PREFERRED_COPY_3}
            <Button icon={MdAdd} onClick={onDismiss}>Add it manually</Button>
        </>
    )
}

function CustomStayForm({ placeType, since, until }) {
    return (
        <>
            You stayed in
            <TextField placeholder="Title" />
            <Separator />
            <Button disabled>Add custom stay</Button>
        </>
    )
}

export default function CustomStayModal({ onClickAway, phase, ...props }) {
    const [placeType, setPlaceType] = useState(StayPlaceType.Accomodation)
    const [showInfoPanel, setShowInfoPanel] = useState(true)

    const onInfoPanelDismiss = () => setShowInfoPanel(false)
    const cancel = () => {
        setPlaceType(StayPlaceType.Accomodation)
        setShowInfoPanel(true)
        onClickAway()
    }

    return (
        <ModalPage header="Add custom stay" isOpen={!!phase} pageStyle={{ width: 520, minHeight: 420 }} onClickAway={cancel} {...props}>
            <Panel contentStyle={{flexDirection: 'row', flex: 1}} style={{flex: 1}}>
                <Panel.Left>
                    {Object.keys(PlaceTypeToIcon).map(type =>
                        <InfoRow
                            selected={placeType === type}
                            icon={PlaceTypeToIcon[type]}
                            title={PlaceTypeToTitle[type]}
                            onClick={() => setPlaceType(type)}
                        />
                    )}
                </Panel.Left>
                <Panel.Right>
                        {placeType === StayPlaceType.Accomodation && showInfoPanel ? 
                            <AccomodationInfoPanel onDismiss={onInfoPanelDismiss}/>
                            : <CustomStayForm placeType={placeType} since={phase.since} until={phase.until}/>}
                </Panel.Right>
            </Panel>
        </ModalPage>
    )
}