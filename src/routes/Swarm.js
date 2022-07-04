import { _checkins, _movies, _videos, _token } from '../swarm/singletons'
import { onlyUnique } from '../array'
import { getCategory } from '../swarm/categories'
import { downloadString, uploadFile } from '../files'
import Button from '../components/Button'
import Page from '../components/Page'
import { useState } from 'react'


const CLIENT_ID = 'JRGEIAQP3LTJWSO2C2U25KSOTLAIPOHOCAWXS31MJXVB1OPP'
const REDIRECT_URL = 'http://raburski.com/begose/auth.php'

const AUTH_URL = `https://foursquare.com/oauth2/authenticate?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URL}`

function onAuthorize() {
  window.location.href = AUTH_URL
}

function onLogout() {
    _token.clear()
    window.location = '/swarm'
}

function Auth() {
    const url_token = new URL(window.location.href).searchParams.get('access_token')
    const access_token = _token.get()
    if (!url_token && !access_token) {
        return <Button onClick={onAuthorize}>Authorize with Foursquare</Button>
    }
    if (!access_token) {
        _token.set(url_token)
        window.location = '/swarm'
        return <b>Logging in...</b>
    }
    return <b>Something went wrong...</b>
}

function onFetchSwarm() {
    return _checkins.fetch().then(() => alert('Checkin list updated!'))
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

function useFetchSwarm() {
    const [isFetching, setFetching] = useState(false)
    function fetch() {
        setFetching(true)
        return onFetchSwarm().then(() => setFetching(false))
    }

    return [isFetching, fetch]
}


export default function Swarm() {
    const isAuthenticated = !!_token.get()
    const [isFetching, fetch] = useFetchSwarm()

    return (
        <Page>
            <h1>Swarm</h1>
            {!isAuthenticated ? <Auth /> : null}
            {isAuthenticated ? <Button disabled={isFetching} onClick={fetch}>{isFetching ? 'Fetching checkins...' : 'Fetch swarm checkins'}</Button>  : null}
            <br /><br /><br /><h3>JSON</h3>
            <Button onClick={onDownloadCheckins}>Download checkins.json</Button>
            <Button onClick={onImportCheckins}>Import checkins.json</Button>
            <h3>Dev tools</h3>
            <Button onClick={onDownloadCategories}>Download categories.json</Button>
            {isAuthenticated ? <Button onClick={onLogout}>Disconnect from swarm</Button> : null}
        </Page>
    )
}

