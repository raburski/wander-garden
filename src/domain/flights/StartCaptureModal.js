import StartCaptureModal from 'components/StartCaptureModal'
import { FlightLogoURL } from './types'
import { useCaptureFlightType } from './Context'

export default function StartFlightCaptureModal({ onStartCapture, flightType, onCancel, ...props }) {
    const captureTourType = useCaptureFlightType()
    const createStartCapture = (flightType) => function onStartCapture(captureNewOnly) {
        captureTourType(flightType, captureNewOnly)
        onCancel()
    }
    return (
        <StartCaptureModal
            header="Capture flights"
            isOpen={!!flightType}
            logoURL={FlightLogoURL[flightType]} 
            onStartCapture={createStartCapture(flightType)}
            onCancel={onCancel}
            {...props}
        />
    )
}
