import InfoPanel from 'components/InfoPanel'
import { ResponsiveSquareImage } from 'components/SquareImage'

const COPY = `You will find chronologically ordered list of your journeys here.
Filter them by country and check hotels you were staying in during your trip.
`

export default function NoTimelineContent() {
    return (
        <InfoPanel
            header="What is this?"
            title="Timeline is a go to place for your travel details!"
            image={<ResponsiveSquareImage size={240} mediumSize={200} smallSize={120} src="/3d/clock.png"/>}
            spacing
        >
            {COPY}
        </InfoPanel>
    )
}