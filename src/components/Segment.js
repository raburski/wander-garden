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

export function Segment({ selectedIndex, titles = [], onClick }) {
    return (
        <SegmentContainer>
            {titles.map((title, index) => {
                const segmentStyle = getSegmentStyle(index, titles.length)
                return <Button selected={index === selectedIndex} style={segmentStyle} onClick={() => onClick(index)}>{title}</Button>
            })}
        </SegmentContainer>
    )
}