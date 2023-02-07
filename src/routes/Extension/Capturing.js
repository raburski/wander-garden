import CenterChildren from "components/CenterChildren"
import InfoPanel from "components/InfoPanel"
import SquareImage from 'components/SquareImage'

const COPY = `Data capture in progress...`

export default function Capturing() {
    return (
        <CenterChildren>
            <InfoPanel spacing contentStyle={{maxWidth: 500}} containerStyle={{alignItems: 'center'}} image={<SquareImage size={200} src="/3d/telescope.png"/>}>
                {COPY}
            </InfoPanel>
        </CenterChildren>
    )
}