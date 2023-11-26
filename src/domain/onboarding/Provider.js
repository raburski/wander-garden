import { useOnboardingFinishedSetting, useRunningDemoSetting } from "domain/settings"
import OnboardingUI from './UI'
import toast from "react-hot-toast"
import { useExtensionStatus } from "domain/extension"
import { useReplaceAll } from "domain/refresh"


export default function OnboardingProvider({ children }) {
    const [onboardingFinished, setOnboardingFinished] = useOnboardingFinishedSetting()
    const [runningDemo, setRunningDemo] = useRunningDemoSetting()
    const extensionStatus = useExtensionStatus()

    const replaceAll = useReplaceAll()

    const onFinished = () => setOnboardingFinished(true)
    async function onDemo() {
        const toastId = toast.loading('Loading demo data...')
        const response = await fetch('/data/demo.json')
        const allData = await response.json()
        setRunningDemo(true)
        toast.dismiss(toastId)
        await replaceAll(allData)
    }
    return (onboardingFinished || runningDemo) ? children : <OnboardingUI onFinished={onFinished} extensionStatus={extensionStatus} onDemo={onDemo}/>
}