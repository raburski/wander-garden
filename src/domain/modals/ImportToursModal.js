import ImportModal from 'components/ImportModal'
import useRefresh from 'domain/refresh'
import { useCapturedToursDiff, useClearCapturedTours, useImportCapturedTours } from 'domain/tours'

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

export default function ImportToursModal() {
    const diff = useCapturedToursDiff()
    const clearCapturedTours = useClearCapturedTours()
    const importCapturedTours = useImportCapturedTours()
    const refresh = useRefresh()

    async function onImportSelected(selected) {
        await importCapturedTours(selected)
        await refresh()
    }

    return (
        <ImportModal
            header="Import tours"
            onCancel={clearCapturedTours}
            onImportSelected={onImportSelected}
            diff={toursDiffToDiff(diff)}
        />
    )
}
