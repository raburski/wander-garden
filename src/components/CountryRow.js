import EmojiRow from './EmojiRow'
import countryFlagEmoji from 'country-flag-emoji'

export default function Country({ code, to, right, ...props }) {
    const country = countryFlagEmoji.get(code)
    return <EmojiRow to={to} emoji={country.emoji} value={country.name} right={right} {...props}/>
}