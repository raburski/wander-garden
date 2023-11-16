import Panel from "components/Panel"
import EmojiRow from "components/EmojiRow"
import { addTripPrices } from "./functions"
import { getDaysAndRangeText } from "date"

const emojiStyle = {
    fontSize: 20,
}

export default function Info({ trip, style }) {
    const since = trip.since
    const until = trip.until
    const dateRange = getDaysAndRangeText(since, until)
    const totalPrices = addTripPrices(trip)
    
    return (
        <Panel style={style}>
            <EmojiRow emojiStyle={emojiStyle} emoji="📅" value={`${dateRange[0]}, ${dateRange[1]}`}/>
            {totalPrices.length > 0 ? <EmojiRow emojiStyle={emojiStyle} emoji="💵" value={totalPrices.map(price => `${parseFloat(price.amount).toFixed(2)} ${price.currency}`).join(', ')}/> : null}
        </Panel>
    )
}