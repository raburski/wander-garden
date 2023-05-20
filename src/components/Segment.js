import Button from "./Button"
import { styled } from "goober"

const SegmentContainer = styled('div')`
    display: flex;
    flex-direction: row;
`

const leftStyle = { borderTopRightRadius: 0, borderBottomRightRadius: 0 }
const rightStyle = { borderTopLeftRadius: 0, borderBottomLeftRadius: 0, marginLeft: -1 }
const defaultStyle = { borderRadius: 0, marginLeft: -1 }

function getSegmentStyle(index, length) {
    if (index === 0) {
        return leftStyle
    } else if (index === length - 1) {
        return rightStyle
    } else {
        return defaultStyle
    }
}

export default function Segment({ selectedIndex, style, titles = [], icons = [], onClick }) {
    const items = Array(Math.max(titles.length, icons.length)).fill(0)
    return (
        <SegmentContainer style={style}>
            {items.map((_, index) => {
                const title = titles[index]
                const icon = icons[index]
                const segmentStyle = getSegmentStyle(index, items.length)
                return <Button icon={icon} selected={index === selectedIndex} key={title} style={segmentStyle} onClick={() => onClick && onClick(index)}>{title}</Button>
            })}
        </SegmentContainer>
    )
}