import Panel from 'components/Panel'
import Modal from 'components/Modal'
import Page from 'components/Page'
import { formattedLocation } from 'domain/location'
import InfoRow from 'components/InfoRow'
import { MdCheckBox, MdCheckBoxOutlineBlank, MdOutlineHourglassEmpty, MdHotel } from 'react-icons/md'
import { useState } from 'react'
import Button from 'components/Button'
import { useCapturedStaysDiff, useClearCapturedStays, useImportCapturedStays } from 'domain/extension'
import { styled } from 'goober'

function StayRow({ stay, icon, onStayClick }) {
    const subtitle = `in ${formattedLocation(stay.location)}`
    const onClick = onStayClick ? () => onStayClick(stay.id) : undefined
    return <InfoRow onClick={onClick} icon={icon} title={stay.accomodation.name} subtitle={subtitle} />
}

const Buttons = styled('div')`
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    padding-top: 12px;
`

export default function ImportModal() {
    const [importing, setImporting] = useState(false)
    const staysDiff = useCapturedStaysDiff()
    const clearCapturedStays = useClearCapturedStays()
    const importCapturedStays = useImportCapturedStays()

    const [unchecked, setUnchecked] = useState({})
    const newStays = staysDiff ? staysDiff.new : []
    const modifiedStays = staysDiff ? staysDiff.modified : []
    const unchangedStays = staysDiff ? staysDiff.unchanged : []
    const allIDs = [...newStays.map(s => s.id), ...modifiedStays.map(s => s.id)]

    const isNothingToImport = allIDs.length === 0

    const onStayClick = (stayID) => {
        setUnchecked({ ...unchecked, [stayID]: !unchecked[stayID] })
    }

    async function importSelected() {
        setImporting(true)
        const selectedIDs = allIDs.filter(id => !unchecked[id])
        await importCapturedStays(selectedIDs)
        setImporting(false)
    }

    return (
        <Modal isOpen={!!staysDiff}>
            <Page header="Import stays" >
                {newStays.length > 0 ? <Panel header="New">
                    {newStays.map(stay => <StayRow onStayClick={onStayClick} stay={stay} icon={unchecked[stay.id] ? MdCheckBoxOutlineBlank : MdCheckBox}/>)}
                </Panel> : null}
                {modifiedStays.length > 0 ? <Panel header="Modified">
                    {modifiedStays.map(stay => <StayRow onStayClick={onStayClick} stay={stay} icon={unchecked[stay.id] ? MdCheckBoxOutlineBlank : MdCheckBox}/>)}
                </Panel> : null}
                {unchangedStays.length > 0 ? <Panel header="Unchanged"><InfoRow icon={MdHotel} title={`${unchangedStays.length} stays`} /></Panel> : null}
                <Buttons>
                    <Button flat onClick={clearCapturedStays}>Cancel</Button>
                    <Button icon={importing ? MdOutlineHourglassEmpty : null} disabled={isNothingToImport || importing} onClick={importSelected}>Import selected</Button>
                </Buttons>
            </Page>
        </Modal>
    )
}
