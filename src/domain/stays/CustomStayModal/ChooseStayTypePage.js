import { FiChevronRight } from 'react-icons/fi'
import { PlaceTypeToIcon, PlaceTypeToTitle, StayPlaceType } from "../types"
import Panel from "components/Panel"
import MenuRow from "components/MenuRow"
import Page from "components/Page"

const TRANSPORT_CATEGORY = [
    StayPlaceType.Car,
    StayPlaceType.Bus,
    StayPlaceType.Airplane,
    StayPlaceType.Train,
]

const COMMON_CATEGORY = [
    StayPlaceType.Accomodation,
    StayPlaceType.Friends,
    StayPlaceType.Couchsurfing,
    StayPlaceType.Sailboat,
    StayPlaceType.Cruiseship,
    StayPlaceType.Campervan,
    StayPlaceType.Camping,
    StayPlaceType.Car,
]

export default function ChooseStayTypePage({ onPlaceTypeSelect, category, ...props }) {
    const placeTypes = category === 'transport' ? TRANSPORT_CATEGORY : COMMON_CATEGORY
    return (
        <Page header="Stay type" {...props}>
            <Panel>
            {placeTypes.map(type =>
                <MenuRow
                    key={type}
                    icon={PlaceTypeToIcon[type]}
                    title={PlaceTypeToTitle[type]}
                    onClick={() => onPlaceTypeSelect(type)}
                    rightIcon={FiChevronRight}
                />
            )}
            </Panel>
        </Page>
    )
}
