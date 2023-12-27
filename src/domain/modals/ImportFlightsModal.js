import { useCapturedFlightsDiff, useClearCapturedFlights, useImportCapturedFlights } from 'domain/flights'
import ImportModal from 'components/ImportModal'
import useRefresh from 'domain/refresh'
import moment from 'moment'

function flightToObject(flight) {
    return {
        id: flight.id,
        title: `${flight.departure.airport} ✈️ ${flight.arrival.airport}`,
        subtitle: moment(flight.departure.scheduled).format('DD/MM/YYYY'),
    }
}

function flightsDiffToDiff(diff) {
    if (!diff) return undefined
    return {
        new: diff.new.map(flightToObject),
        modified: diff.modified.map(flightToObject),
        unchanged: diff.unchanged.map(flightToObject),
    }
}

export default function ImportFlightsModal() {
    const diff = useCapturedFlightsDiff()
    const clearCaptured = useClearCapturedFlights()
    const importCaptured = useImportCapturedFlights()
    const refresh = useRefresh()

    async function onImportSelected(selected) {
        await importCaptured(selected)
        await refresh()
    }

    return (
        <ImportModal
            header="Import flights"
            onCancel={clearCaptured}
            onImportSelected={onImportSelected}
            diff={flightsDiffToDiff(diff)}
        />
    )
}
