import Base64 from "Base64"
import Button from "components/Button"
import InputRow from "components/InputRow"
import { ModalPageButtons } from "components/ModalPage"
import Page from "components/Page"
import Panel from "components/Panel"
import { Column, Row } from 'components/container';
import Separator from "components/Separator"
import SquareImage from "components/SquareImage"
import GoogleMaps, { Icon } from "domain/map"
import { PlaceTypeToIcon, StayLogoURL, StayName, detectStayType, getStayTypeIcon, isStayData, useStartFileImport } from "domain/stays"
import { MdCalendarToday, MdCalendarViewMonth, MdOutlineCalendarToday, MdOutlineCalendarViewMonth, MdPeopleAlt } from "react-icons/md"
import { useSearchParams } from "react-router-dom"
import moment from "moment"
import { VscCalendar } from "react-icons/vsc"
import { TbCalendar } from "react-icons/tb"
import { styled } from "goober"
import EmojiRow from "components/EmojiRow"
import { formattedLocation } from "domain/location"
import countryFlagEmoji from "country-flag-emoji"
import createEmojiIcon from "components/createEmojiIcon"

const StayTypeHeaderContainer = styled('div')`
    display: flex;
    flex-direction: row;
    padding: 12px;
    align-items: stretch;
`

const StayTypeHeaderTitle = styled('div')`
    display: flex;
    flex: 1;
    font-size: 18px;
    margin-left: 16px;
    align-items: center;
    font-size: .975rem;
    font-weight: 600;
    line-height: 1.25rem
`

function StayTypeHeader({ stayType }) {
return (
    <StayTypeHeaderContainer>
        <SquareImage size={24} src={StayLogoURL[stayType]} />
        <StayTypeHeaderTitle>{StayName[stayType]}</StayTypeHeaderTitle>
    </StayTypeHeaderContainer>
)
}

export default function Stay() {
    const [params] = useSearchParams()
    const data = params.get('data')
    const stay = JSON.parse(Base64.decode(data))
    const stayType = detectStayType(stay)
    const startImport = useStartFileImport()

    if (isStayData(stay)) return null

    const markers = [{ stay, position: stay.location, icon: Icon.Default }]
    const flag = countryFlagEmoji.get(stay.location.cc).emoji
    const FlagIcon = createEmojiIcon(flag)

    function importStay() {
        startImport(stay)
    }

    return (
        <Page header={stay.accomodation.name}>
            <Row>
                <Column style={{flex:1}}>
                    <Panel>
                        <StayTypeHeader stayType={stayType}/>
                        {stay.accomodation?.name ? <InputRow icon={stay.placeType ? PlaceTypeToIcon[stay.placeType] : getStayTypeIcon(stayType)} value={stay.accomodation?.name} disabled/> : null}
                        {stay.totalGuests ? <InputRow icon={MdPeopleAlt} type="number" placeholder="Total guests (optional)" value={stay.totalGuests} disabled/> : null}
                        <InputRow icon={MdOutlineCalendarToday} value={`${moment(stay.since).format('DD/MM/YYYY')} - ${moment(stay.until).format('DD/MM/YYYY')}`} disabled/>
                        <InputRow icon={FlagIcon} value={formattedLocation(stay.location)} disabled/>
                    </Panel>
                    <ModalPageButtons>
                        <Button onClick={importStay}>Import stay</Button> 
                    </ModalPageButtons>
                </Column>
            <Separator />
            <Panel style={{flex: 1, alignSelf: 'stretch', flexShrink: 2, minHeight: '400px'  }} contentStyle={{ flex: 1, display: 'flexbox', alignSelf: 'stretch'}}>
                <GoogleMaps initPositions={[stay.location]} markers={markers} style={{height: 100}}/>
            </Panel>
            </Row>
        </Page>
    )
}