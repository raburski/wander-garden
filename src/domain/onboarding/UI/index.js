import { Status, useCapturedStaysDiff } from "domain/stays"
import Extension from "./Extension"
import Intro from './Intro'
import Capture from './Capture'
import Finished from './Finished'
import { useEffect, useState } from "react"

const STEP = {
    Intro: 'INTRO',
    Extension: 'EXTENSION',
    Capture: 'CAPTURE',
    Finished: 'FINISHED',
}

export default function OnboardingUI({ onFinished, extensionStatus }) {
    const initialState = extensionStatus === Status.Connected ? STEP.Capture : STEP.Intro
    const [step, setStep] = useState(initialState)
    const capturedStays = useCapturedStaysDiff()

    useEffect(() => {
        if (extensionStatus === Status.Connected) {
            setStep(STEP.Capture)
        }
    }, [extensionStatus])

    useEffect(() => {
        if (capturedStays && capturedStays.new.length > 0) {
            setStep(STEP.Finished)
        }
    }, [capturedStays])

    switch (step) {
        case STEP.Intro:
            return <Intro onNext={() => setStep(STEP.Extension)}/>
        case STEP.Extension:
            return <Extension onNext={() => setStep(STEP.Capture)}/>
        case STEP.Capture:
            return <Capture onNext={() => setStep(STEP.Finished)}/>
        case STEP.Finished:
            return <Finished onNext={onFinished}/>
        default:
            return null
    }

}