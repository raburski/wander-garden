import { StayPlaceType } from "../types"
import { useState } from "react"
import { openDiscord } from "SideBar"
import Modal from "components/Modal"

import WhatToDoOptionsPage from "./WhatToDoOptionsPage"
import ExtendStayPage from "./ExtendStayPage"
import CustomStayPage from "./CustomStayPage"
import ChooseStayTypePage from "./ChooseStayTypePage"
import UploadFromFriendPage from "./UploadFromFriendPage"

const STAY_CATEGORY = {
    TRANSPORT: 'transport',
    COMMON: 'common'
}

const WIDTH = 500
export default function CustomStayModal({ onClickAway, phase, previousPhase, stay, ...props }) {
    const [addStayConfirmed, setAddStayConfirmed] = useState(!!stay)
    const [uploadFromFriendConfirmed, setUploadFromFriendConfirmed] = useState(false)
    const [selectedStayType, setSelectedStayType] = useState(stay?.placeType)
    

    const cancel = () => {
        setAddStayConfirmed(false)
        setUploadFromFriendConfirmed(false)
        setSelectedStayType(undefined)
        onClickAway()
    }

    const onAddCustomStay = () => setAddStayConfirmed(STAY_CATEGORY.COMMON)
    const onAddTransit = () => setAddStayConfirmed(STAY_CATEGORY.TRANSPORT)
    const onExtendStay = () => setSelectedStayType(StayPlaceType.Extension)
    const onContactUs = () => { openDiscord(); cancel() }
    const onImportFromFriend = () => setUploadFromFriendConfirmed(true)

    const onBackFromChoseStayType = () => setAddStayConfirmed(false)
    const onPlaceTypeSelect = type => setSelectedStayType(type)
    const onBackFromAddStay = () => setSelectedStayType(undefined)
    const onBackFromFriend = () => setUploadFromFriendConfirmed(false)

    if (!phase && !stay) return null

    return (
        <Modal isOpen={!!phase || !!stay}  onClickAway={cancel} {...props}>
            {!addStayConfirmed && !selectedStayType && !uploadFromFriendConfirmed ? 
                <WhatToDoOptionsPage key="info" style={{ width: WIDTH, }} layout
                    previousPhase={previousPhase}
                    onAddCustomStay={onAddCustomStay}
                    onAddTransit={onAddTransit}
                    onExtendStay={onExtendStay}
                    onContactUs={onContactUs}
                    onImportFromFriend={onImportFromFriend}
                /> : null
            }
            {addStayConfirmed && !selectedStayType ? 
                <ChooseStayTypePage
                    key="info"
                    category={addStayConfirmed}
                    style={{ width: WIDTH, }}
                    layout
                    onBack={onBackFromChoseStayType}
                    onPlaceTypeSelect={onPlaceTypeSelect}
                /> : null
            }
            {selectedStayType && selectedStayType === StayPlaceType.Extension && previousPhase ?
                <ExtendStayPage
                    key="info"
                    style={{ width: WIDTH, }}
                    layout
                    phase={phase}
                    previousPhase={previousPhase}
                    onFinished={cancel}
                    onBack={onBackFromAddStay}
                /> : null
            }
            {(selectedStayType && selectedStayType !== StayPlaceType.Extension) || stay ?
                <CustomStayPage
                    key="info"
                    style={{ width: WIDTH, }}
                    layout
                    placeType={selectedStayType}
                    stay={stay}
                    phase={phase}
                    previousPhase={previousPhase}
                    onFinished={cancel}
                    onBack={onBackFromAddStay}
                /> : null
            }
            {uploadFromFriendConfirmed ?
                <UploadFromFriendPage
                    key="info"
                    style={{ width: WIDTH, }}
                    layout
                    onBack={onBackFromFriend}
                    onFinished={cancel}
                /> : null 
            }
        </Modal>
    )
}