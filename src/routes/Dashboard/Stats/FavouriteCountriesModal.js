import ModalPage from "components/ModalPage"
import Panel from "components/Panel"
import EmojiRow from "components/EmojiRow"
import { useNavigate } from "react-router"

export function FavouriteCountriesModal({ favouriteCountries, ...props }) {
    const navigate = useNavigate()

    return (
        <ModalPage header="Favourite countries" {...props}>
            <Panel>
                {favouriteCountries?.map(country => 
                    <EmojiRow
                        emoji={country.emoji}
                        value={country.name}
                        key={country.name}
                        right={`${country.days} days`}
                        onClick={() => navigate(`/timeline?cc=${country.code}`)}
                    />
                )}
            </Panel>
        </ModalPage>
    )
}