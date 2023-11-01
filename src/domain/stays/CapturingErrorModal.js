import SquareImage from 'components/SquareImage'
import ModalPage from "components/ModalPage"
import InfoPanel from 'components/InfoPanel'

export default function CapturingErrorModal({ error, location, stack, ...props }) {
    const text = `We have encountered a problem...
if this is reocurring please let us know through discord!

${stack}

${location ? `in ${location}` : ''}
`
    return (
        <ModalPage header="Capture failed!" pageStyle={{maxWidth: 600}} {...props}>
            <InfoPanel
                spacing
                title="Oupssssie..."
                image={<SquareImage src="/3d/forestfire.png" size={180}/>}
                text={text}
            />
            
        </ModalPage>
    )
}