import Panel from 'components/Panel'
import Modal from 'components/Modal'
import Page from 'components/Page'
import Button from 'components/Button'
import ModalPage, { ModalPageButtons } from 'components/ModalPage'
import { FiExternalLink } from 'react-icons/fi'
import { StayLogoURL, useCaptureStayType } from 'domain/extension'
import { styled } from 'goober'
import { useState } from 'react'
import { useSetting } from 'settings'
import Segment from 'components/Segment'

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

const CAPTURE_SETTING_NAME = 'stay_capture_new_only'
const SETTING_TITLES = ['All', 'New only']

function CaptureSetting({ onChange, selectedIndex }) {
    return <SettingContainer>Capture mode: <Segment titles={SETTING_TITLES} selectedIndex={selectedIndex} onClick={onChange}/></SettingContainer>
}

export default function StartCaptureModal({ onStartCapture, stayType, onCancel, ...props }) {
    const [captureNewOnly, setCaptureNewOnly] = useSetting(CAPTURE_SETTING_NAME, false)
    const captureStayType = useCaptureStayType()

    const createStartCapture = (stayType) => function onStartCapture() {
        captureStayType(stayType, setCaptureNewOnly)
    }

    const onCaptureSettingChange = (index) => setCaptureNewOnly(index === 0 ? false : true)

    return (
        <ModalPage header="Capture stays" isOpen={stayType} onClickAway={onCancel} {...props}>
            <Logo src={StayLogoURL[stayType]}/>
            <SettingsPanel header="Settings" spacing>
                <CaptureSetting onChange={onCaptureSettingChange} selectedIndex={captureNewOnly ? 1 : 0}/>
            </SettingsPanel>
            <ModalPageButtons>
                <Button flat onClick={onCancel}>Cancel</Button>
                <Button icon={FiExternalLink} onClick={stayType ? createStartCapture(stayType) : undefined}>Start capture</Button>
            </ModalPageButtons>
        </ModalPage>
    )
}
