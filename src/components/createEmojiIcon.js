export default function createEmojiIcon(emoji) {
    return function EmojiIcon() { return <div>{emoji}</div> }
}