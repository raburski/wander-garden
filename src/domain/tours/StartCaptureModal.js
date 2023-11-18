import StartCaptureModal from 'components/StartCaptureModal'
import { TourLogoURL } from './types'
import { useCaptureTourType } from './Context'

export default function StartTourCaptureModal({ onStartCapture, tourType, onCancel, ...props }) {
    const captureTourType = useCaptureTourType()
    const createStartCapture = (tourType) => function onStartCapture(captureNewOnly) {
        captureTourType(tourType, captureNewOnly)
        onCancel()
    }
    return (
        <StartCaptureModal
            header="Capture tours"
            isOpen={!!tourType}
            logoURL={TourLogoURL[tourType]} 
            onStartCapture={createStartCapture(tourType)}
            onCancel={onCancel}
            {...props}
        />
    )
}
