import { useIsAuthenticated, _checkins, _movies, _videos, _token } from '../swarm/singletons'
import { onlyUnique } from '../array'
import { getCategory } from '../swarm/categories'
import { downloadString, uploadFile } from '../files'
import Button from '../components/Button'
import Page from '../components/Page'
import AuthenticateButton from '../bindings/swarm/AuthenticateButton'
import FetchCheckinsButton from '../bindings/swarm/FetchCheckinsButton'

function onLogout() {
    _token.clear()
    window.location = '/swarm'
}

function onDownloadCheckins() {
    downloadString(JSON.stringify(_checkins.get()), 'json', 'checkins.json')
}

function onDownloadCategories() {
    const checkins = _checkins.get()
    const categories = checkins.flatMap(checkin => checkin.venue.categories)
    const categoryIDs = categories.map(category => category.id).filter(onlyUnique)
    const uniqueCategories = categoryIDs.map(id => categories.find(cat => cat.id === id)).map(cat => ({
        id: cat.id,
        name: cat.name,
        shortName: cat.shortName,
        pluralName: cat.pluralName,
        emoji: getCategory(cat.id)?.emoji,
    }))

    downloadString(JSON.stringify(uniqueCategories), 'json', 'categories.json')
}

function onImportCheckins() {
    uploadFile().then(files => {
        const items = JSON.parse(files)
        if (items.length > 0 && window.confirm(`${items.length} checkins found. Are you sure you want to replace currently stored ones?`)) {
            _checkins.set(items)
            alert('Imported!')
        }
    })
}

export default function Swarm() {
    const isAuthenticated = useIsAuthenticated()
    

    return (
        <Page header="Swarm">
            {!isAuthenticated ? <AuthenticateButton /> : null}
            {isAuthenticated ? <FetchCheckinsButton />  : null}
            <br /><br /><br /><h3>JSON</h3>
            <Button onClick={onDownloadCheckins}>Download checkins.json</Button>
            <Button onClick={onImportCheckins}>Import checkins.json</Button>
            <h3>Dev tools</h3>
            <Button onClick={onDownloadCategories}>Download categories.json</Button>
            {isAuthenticated ? <Button onClick={onLogout}>Disconnect from swarm</Button> : null}
        </Page>
    )
}

