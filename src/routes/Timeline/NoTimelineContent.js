import InfoPanel from 'components/InfoPanel'
import SquareImage from 'components/SquareImage'

const COPY = `You will find chronologically ordered list of your journeys here.
Filter them by country or by the type of the trip.
Check hotels you were staying in and stages of your trip.
`

export default function NoTimelineContent() {
    return (
        <InfoPanel header="What is this?" title="Timeline is a go to place for your travel details!" image={<SquareImage size={220} src="/3d/clock.png"/>}>
            {COPY}
        </InfoPanel>
    )
}