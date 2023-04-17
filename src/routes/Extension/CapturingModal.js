import SquareImage from 'components/SquareImage'
import ModalPage from "components/ModalPage"

export default function CapturingModal({ ...props }) {
    return (
        <ModalPage header="Capture in progress..." pageStyle={{alignItems: 'center', paddingBottom: 32}} {...props}>
            <SquareImage size={200} src="/3d/telescope.png"/>
        </ModalPage>
    )
}