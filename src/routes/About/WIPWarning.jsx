import InfoPanel from 'components/InfoPanel'
import PanelWarningIcon from 'components/PanelWarningIcon'

const COPY = `This website is still under development. Please do expect some breaking changes and partly finished features.
Any feedback welcome nonetheless! Reach me out through my personal website below.
`

export default function WIPWarning() {
    return (
        <InfoPanel 
            spacing
            header="Work in progress!"
            image={<PanelWarningIcon />}
        >
            {COPY}
        </InfoPanel>
    )
}