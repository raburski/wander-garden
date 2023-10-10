import Panel from 'components/Panel'
import Button from 'components/Button'
import ModalPage, { ModalPageButtons } from 'components/ModalPage'
import { FiExternalLink, FiChevronRight, FiChevronDown } from 'react-icons/fi'
import { SlPuzzle } from 'react-icons/sl'
import { Status, StayLogoURL, useCaptureStayType, useExtensionStatus } from 'domain/stays'
import { styled } from 'goober'
import { useState } from 'react'
import { useSetting } from 'settings'
import Segment from 'components/Segment'
import { useNavigate } from 'react-router'
import SquareImage from 'components/SquareImage'
import PinButton from 'components/PinButton'

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

const SettingsPanelStyled = styled(Panel)`
    margin-top: 42px;
`

const SettingsHeader = styled('span')`
    display: flex;
    flex: 1;
`

function SettingsPanel({ children, header, ...props }) {
    const [visible, setVisible] = useState(false)
    const onChevronClick = () => {
        setVisible(!visible)
    }

    const pinIcon = visible ? FiChevronDown : FiChevronRight 
    return (
        <SettingsPanelStyled header={<><SettingsHeader>{header}</SettingsHeader> <PinButton icon={pinIcon} onClick={onChevronClick}/></>} {...props}>
            {visible ? children : null}
        </SettingsPanelStyled>
    )
}

const ExtensionRequiredContainer = styled('div')`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    white-space: pre-wrap;
    color: ${props => props.theme.text}
`

const CAPTURE_SETTING_NAME = 'stay_capture_new_only'
const SETTING_TITLES = ['All stays', 'Only new stays']

const EXTENSION_REQ_COPY = `
Working browser extension required.

`

function WorkingExtensionRequired({ onCancel }) {
    const navigate = useNavigate()
    const onGoToExtension = () => {
        navigate('/stays')
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
    return <SettingContainer>Capture: <Segment titles={SETTING_TITLES} selectedIndex={selectedIndex} onClick={onChange} style={{marginLeft: 12}}/></SettingContainer>
}

const StartButton = styled(Button)`
    margin-top: 32px;
    font-size: 18px;
    align-self: center;
    padding: .85rem 1.0rem;
`

const LoginCopy = styled('div')`
    margin-top: 42px;
    font-weight: bold;
    text-align: center;
    color: ${props => props.theme.text};
`

const LOGIN_COPY = `You may need to log in!`

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
        <ModalPage header="Capture stays" isOpen={stayType} onClickAway={onCancel} pageStyle={{minWidth:342}} {...props}>
            {extensionStatus !== Status.Connected ? 
                <WorkingExtensionRequired onCancel={onCancel}/>
            :   <>
                    <Logo src={StayLogoURL[stayType]}/>
                    <LoginCopy>{LOGIN_COPY}</LoginCopy>
                    <StartButton icon={FiExternalLink} onClick={stayType ? createStartCapture(stayType) : undefined}>Start</StartButton>
                    <SettingsPanel header="Settings" spacing>
                        <CaptureSetting onChange={onCaptureSettingChange} selectedIndex={captureNewOnly ? 1 : 0}/>
                    </SettingsPanel>
                </>
            }
        </ModalPage>
    )
}
