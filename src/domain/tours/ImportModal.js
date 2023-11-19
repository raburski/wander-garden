import ImportModal from 'components/ImportModal'

function tourToObject(tour) {
    return { id: tour.id, title: tour.title }
}

function toursDiffToDiff(diff) {
    if (!diff) return undefined
    return {
        new: diff.new.map(tourToObject),
        modified: diff.modified.map(tourToObject),
        unchanged: diff.unchanged.map(tourToObject),
    }
}

export default function ImportToursModal({ diff, onCancel, onImportSelected }) {
    return (
        <ImportModal
            header="Import tours"
            onCancel={onCancel}
            onImportSelected={onImportSelected}
            diff={toursDiffToDiff(diff)}
        />
    )
}
