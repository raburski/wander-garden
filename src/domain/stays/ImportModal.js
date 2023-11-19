import { formattedLocation } from 'domain/location'
import { useCapturedStaysDiff, useClearCapturedStays, useImportCapturedStays } from 'domain/stays'
import ImportModal from 'components/ImportModal'

function stayToObject(stay) {
    return { id: stay.id, title: stay.accomodation.name, subtitle: `in ${formattedLocation(stay.location)}` }
}

function staysDiffToDiff(diff) {
    if (!diff) return undefined
    return {
        new: diff.new.map(stayToObject),
        modified: diff.modified.map(stayToObject),
        unchanged: diff.unchanged.map(stayToObject),
    }
}

export default function ImportStaysModal() {
    const staysDiff = useCapturedStaysDiff()
    const clearCapturedStays = useClearCapturedStays()
    const importCapturedStays = useImportCapturedStays()

    return (
        <ImportModal
            header="Import stays"
            onCancel={clearCapturedStays}
            onImportSelected={importCapturedStays}
            diff={staysDiffToDiff(staysDiff)}
        />
    )
}
