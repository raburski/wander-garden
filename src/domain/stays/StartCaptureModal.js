import { StayLogoURL, useCaptureStayType } from 'domain/stays'
import StartCaptureModal from 'components/StartCaptureModal'

export default function StartStayCaptureModal({ onStartCapture, stayType, onCancel, ...props }) {
    const captureStayType = useCaptureStayType()
    const createStartCapture = (stayType) => function onStartCapture(captureNewOnly) {
        captureStayType(stayType, captureNewOnly)
        onCancel()
    }
    return (
        <StartCaptureModal
            header="Capture stays"
            isOpen={!!stayType}
            logoURL={StayLogoURL[stayType]} 
            onStartCapture={createStartCapture(stayType)}
            onCancel={onCancel}
            {...props}
        />
    )
}
