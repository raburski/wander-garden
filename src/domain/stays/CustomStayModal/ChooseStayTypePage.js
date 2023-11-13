import { FiChevronRight } from 'react-icons/fi'
import { PlaceTypeToIcon, PlaceTypeToTitle } from "../types"
import Panel from "components/Panel"
import MenuRow from "components/MenuRow"
import Page from "components/Page"

export default function ChooseStayTypePage({ onPlaceTypeSelect, ...props }) {
    return (
        <Page header="Stay type" {...props}>
            <Panel>
            {Object.keys(PlaceTypeToTitle).map(type =>
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
