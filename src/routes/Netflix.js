import { _checkins, _movies, _videos } from '../swarm/singletons'
import { styled } from 'goober'
import { uploadFile, parseCSVLine } from '../files'
import Button from '../components/Button'
import Page from '../components/Page'

function onImportNetflix() {
    uploadFile('.csv').then(files => {
        if (files[0]) {
            const lines = files[0].split(/\r?\n/).filter(Boolean).slice(1).map(parseCSVLine)
            const movies = lines.map(line => ({
                    title: line[0],
                    date: line[1],
            }))
            console.log(movies)
            if (movies.length > 0 && window.confirm(`${movies.length} titles found. Are you sure you want to replace currently stored ones?`)) {
                _movies.set(movies)
                alert('Imported!')
            }
        }
    })
}

export default function Netflix() {
    return (
        <Page title="Netflix">
            <Button onClick={onImportNetflix}>Import NetflixViewingHistory.csv</Button>
        </Page>
    )
}