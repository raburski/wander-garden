import Panel from "components/Panel"
import EmojiRow from "components/EmojiRow"
import { addTripPrices } from "./functions"
import { getDaysAndRangeText } from "date"
import { useEditSubjectNote, useSubjectNote } from "domain/notes"

const emojiStyle = {
    fontSize: 20,
    marginRight: 8,
}

function getNoteValue(note) {
    if (note.highlight && note.text) {
        return `${note.highlight}

${note.text}`
    } else if (note.highlight) {
        return note.highlight
    } else if (note.text) {
        return note.text
    }

}

function NoteRows({ note, ...props }) {
    const value = getNoteValue(note)
    return <EmojiRow emojiStyle={{...emojiStyle, alignSelf: 'flex-start'}} emoji="✏️" value={value} {...props}/>
}

export default function Info({ trip, style }) {
    const note = useSubjectNote(trip.id)
    const editNote = useEditSubjectNote()
    const since = trip.since
    const until = trip.until
    const dateRange = getDaysAndRangeText(since, until)
    const totalPrices = addTripPrices(trip)

    const onEditNoteClick = () => editNote(trip.id)
    
    return (
        <Panel style={style}>
            <EmojiRow emojiStyle={emojiStyle} emoji="📅" value={`${dateRange[0]}, ${dateRange[1]}`}/>
            {totalPrices.length > 0 ? <EmojiRow emojiStyle={emojiStyle} emoji="💵" value={totalPrices.map(price => `${parseFloat(price.amount).toFixed(2)} ${price.currency}`).join(', ')}/> : null}
            {note ? <NoteRows note={note} onClick={onEditNoteClick}/> 
            : <EmojiRow emojiStyle={emojiStyle} emoji="✏️" value="Add note..." onClick={onEditNoteClick}/>}
        </Panel>
    )
}