import ModalPage from "components/ModalPage"
import Panel from "components/Panel"
import EmojiRow from "components/EmojiRow"

export function SeasonsModal({ favouriteSeasons, ...props }) {

    return (
        <ModalPage header="Favourite seasons" {...props}>
            <Panel>
                {favouriteSeasons?.map(season => <EmojiRow emoji={season.emoji} value={season.name} key={season.name} right={`${season.days} days`}/>)}
            </Panel>
        </ModalPage>
    )
}