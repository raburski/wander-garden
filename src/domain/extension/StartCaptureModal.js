import Panel from 'components/Panel'
import Modal from 'components/Modal'
import Page from 'components/Page'
import Button from 'components/Button'
import ModalPage, { ModalPageButtons } from 'components/ModalPage'
import { FiExternalLink } from 'react-icons/fi'
import { SlPuzzle } from 'react-icons/sl'
import { Status, StayLogoURL, useCaptureStayType, useExtensionStatus } from 'domain/extension'
import { styled } from 'goober'
import { useState } from 'react'
import { useSetting } from 'settings'
import Segment from 'components/Segment'
import { useNavigate } from 'react-router'
import SquareImage from 'components/SquareImage'

const Logo = styled('img')`
    width: 112px;
    height: 112px;
    padding: 6px;
    margin-top: 22px;
    align-self: center;
`

const SettingContainer = styled('div')`
    margin-left: 12px;

    display: flex;
    justify-content: space-between;
    align-items: center;
`

const SettingsPanel = styled(Panel)`
    margin-top: 32px;
    margin-bottom: 32px;
`

const ExtensionRequiredContainer = styled('div')`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    white-space: pre-wrap;
`

const CAPTURE_SETTING_NAME = 'stay_capture_new_only'
const SETTING_TITLES = ['All', 'New only']

const EXTENSION_REQ_COPY = `
Working browser extension required.

`

function WorkingExtensionRequired({ onCancel }) {
    const navigate = useNavigate()
    const onGoToExtension = () => {
        navigate('/extension')
        onCancel()
    }
    return (
        <ExtensionRequiredContainer>
            <SquareImage src="/3d/puzzle.png"/>
            {EXTENSION_REQ_COPY}
            <ModalPageButtons>
                <Button flat onClick={onCancel}>Cancel</Button>
                <Button icon={SlPuzzle} onClick={onGoToExtension}>Go to extension</Button>
            </ModalPageButtons>
        </ExtensionRequiredContainer>
    )
}

function CaptureSetting({ onChange, selectedIndex }) {
    return <SettingContainer>Capture mode: <Segment titles={SETTING_TITLES} selectedIndex={selectedIndex} onClick={onChange}/></SettingContainer>
}

export default function StartCaptureModal({ onStartCapture, stayType, onCancel, ...props }) {
    const extensionStatus = useExtensionStatus()
    const [captureNewOnly, setCaptureNewOnly] = useSetting(CAPTURE_SETTING_NAME, false)
    const captureStayType = useCaptureStayType()

    const createStartCapture = (stayType) => function onStartCapture() {
        captureStayType(stayType, captureNewOnly)
        onCancel()
    }

    const onCaptureSettingChange = (index) => setCaptureNewOnly(index === 0 ? false : true)

    return (
        <ModalPage header="Capture stays" isOpen={stayType} onClickAway={onCancel} {...props}>
            {extensionStatus !== Status.Connected ? 
                <WorkingExtensionRequired onCancel={onCancel}/>
            :   <>
                    <Logo src={StayLogoURL[stayType]}/>
                    <SettingsPanel header="Settings" spacing>
                        <CaptureSetting onChange={onCaptureSettingChange} selectedIndex={captureNewOnly ? 1 : 0}/>
                    </SettingsPanel>
                    <ModalPageButtons>
                        <Button flat onClick={onCancel}>Cancel</Button>
                        <Button icon={FiExternalLink} onClick={stayType ? createStartCapture(stayType) : undefined}>Start capture</Button>
                    </ModalPageButtons>
                </>
            }
        </ModalPage>
    )
}
