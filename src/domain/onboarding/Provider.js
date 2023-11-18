import { useOnboardingFinishedSetting, useRunningDemoSetting } from "domain/settings"
import OnboardingUI from './UI'
import { useReplaceAllStays } from "domain/stays"
import toast from "react-hot-toast"
import { useCheckins } from "domain/swarm"
import { useExtensionStatus } from "domain/extension"


export default function OnboardingProvider({ children }) {
    const [onboardingFinished, setOnboardingFinished] = useOnboardingFinishedSetting()
    const [runningDemo, setRunningDemo] = useRunningDemoSetting()
    const extensionStatus = useExtensionStatus()
    const replaceAllStays = useReplaceAllStays()
    const [_, setCheckins] = useCheckins()

    const onFinished = () => setOnboardingFinished(true)
    async function onDemo() {
        const toastId = toast.loading('Loading demo data...')
        const response = await fetch('/data/demo.json')
        const allData = await response.json()
        setRunningDemo(true)
        await setCheckins(allData.checkins)
        await replaceAllStays(allData.stays)
        toast.dismiss(toastId)
        toast.success('Demo active!')
    }
    return (onboardingFinished || runningDemo) ? children : <OnboardingUI onFinished={onFinished} extensionStatus={extensionStatus} onDemo={onDemo}/>
}