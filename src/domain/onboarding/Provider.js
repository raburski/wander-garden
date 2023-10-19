import { useSetting } from "settings"
import OnboardingUI from './UI'
import { useExtensionStatus } from "domain/stays"

export default function OnboardingProvider({ children }) {
    const [onboardingFinished, setOnboardingFinished] = useSetting('onboarding_finished', true)
    const extensionStatus = useExtensionStatus()
    const onFinished = () => setOnboardingFinished(true)
    return onboardingFinished ? children : <OnboardingUI onFinished={onFinished} extensionStatus={extensionStatus}/>
}