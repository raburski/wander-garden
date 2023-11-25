import ModalPage from "components/ModalPage"
import Panel from "components/Panel"
import EmojiRow from "components/EmojiRow"

export function RegionsModal({ favouriteRegions, ...props }) {

    return (
        <ModalPage header="Favourite regions" {...props}>
            <Panel>
                {favouriteRegions?.map(region => <EmojiRow emoji={region.emoji} value={region.name} right={`${region.days} days`}/>)}
            </Panel>
        </ModalPage>
    )
}