import Panel from 'components/Panel'
import { formattedLocation } from 'domain/location'
import InfoRow from 'components/InfoRow'
import { MdCheckBox, MdCheckBoxOutlineBlank, MdOutlineHourglassEmpty, MdHotel } from 'react-icons/md'
import { useState } from 'react'
import Button from 'components/Button'
import { useCapturedStaysDiff, useClearCapturedStays, useImportCapturedStays } from 'domain/stays'
import ModalPage, { ModalPageButtons } from 'components/ModalPage'
import { styled } from 'goober'

function ObjectRow({ object, icon, onObjectClick }) {
    const onClick = onObjectClick ? () => onObjectClick(object.id) : undefined
    return <InfoRow onClick={onClick} icon={icon} title={object.title} subtitle={object.subtitle} />
}

const NothingContainer = styled('div')`
    padding: 8px;
    font-size: 16px;
    color: ${props => props.theme.text};
`

function NothingToImport() {
    return <NothingContainer>Nothing new to import found...</NothingContainer>
}

export default function ImportModal({ diff, header, onImportSelected, onCancel }) {
    const [importing, setImporting] = useState(false)

    const [unchecked, setUnchecked] = useState({})
    const newObjects = diff ? diff.new : []
    const modifiedObjects = diff ? diff.modified : []
    const unchangedObjects = diff ? diff.unchanged : []
    const allIDs = [...newObjects.map(s => s.id), ...modifiedObjects.map(s => s.id)]

    const isNothingToImport = allIDs.length === 0
    const isEmptyImport = isNothingToImport && unchangedObjects.length === 0

    const onObjectClick = (objectID) => {
        setUnchecked({ ...unchecked, [objectID]: !unchecked[objectID] })
    }

    async function importSelected() {
        setImporting(true)
        const selectedIDs = allIDs.filter(id => !unchecked[id])
        await onImportSelected(selectedIDs)
        setImporting(false)
    }

    return (
        <ModalPage isOpen={!!diff} header={header}>
            {isEmptyImport ? <NothingToImport /> : null}
            {newObjects.length > 0 ? <Panel header="New">
                {newObjects.map(object => <ObjectRow key={object.id} onObjectClick={onObjectClick} object={object} icon={unchecked[object.id] ? MdCheckBoxOutlineBlank : MdCheckBox}/>)}
            </Panel> : null}
            {modifiedObjects.length > 0 ? <Panel header="Modified">
                {modifiedObjects.map(object => <ObjectRow key={object.id} onObjectClick={onObjectClick} object={object} icon={unchecked[object.id] ? MdCheckBoxOutlineBlank : MdCheckBox}/>)}
            </Panel> : null}
            {unchangedObjects.length > 0 ? <Panel header="Unchanged"><InfoRow icon={MdHotel} title={`${unchangedObjects.length} items`} /></Panel> : null}
            <ModalPageButtons>
                <Button flat onClick={onCancel}>Cancel</Button>
                <Button icon={importing ? MdOutlineHourglassEmpty : null} disabled={isNothingToImport || importing} onClick={importSelected}>Import selected</Button>
            </ModalPageButtons>
        </ModalPage>
    )
}
