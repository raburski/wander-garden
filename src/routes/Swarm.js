import { useIsAuthenticated, useCheckins, useToken } from '../domain/swarm'
import { useLastUpdated } from '../domain/swarm'
import { onlyUnique } from '../array'
import { getCategory } from '../domain/swarm/categories'
import { downloadString, uploadFile } from '../files'
import Button from '../components/Button'
import Page from '../components/Page'
import Panel from '../components/Panel'
import InfoPanel from '../components/InfoPanel'
import Separator from '../components/Separator'
import SquareImage from '../components/SquareImage'
import AuthenticateButton from '../bindings/swarm/AuthenticateButton'
import FetchCheckinsButton from '../bindings/swarm/FetchCheckinsButton'
import { styled } from 'goober'
import { IoLogoFoursquare } from 'react-icons/io'

function useLogout() {
    const [_, setToken] = useToken()
    return () => setToken(null)
}

function useClearData() {
    const [_, setCheckins] = useCheckins()
    const [__, setLastUpdated] = useLastUpdated()
    return () => {
        if (window.confirm('Are you really sure you want to wipe checkin data from your browsers storage?')) {
            setCheckins([])
            setLastUpdated(null)
        }
    }
}

function useDownloadCheckins() {
    const [checkins] = useCheckins()
    return () => downloadString(JSON.stringify(checkins), 'json', 'checkins.json')
}

function useDownloadCategories() {
    const [checkins] = useCheckins()
    return () => {
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
}

function useImportCheckins() {
    const [_, setCheckins] = useCheckins()
    return () => uploadFile().then(files => {
        const items = JSON.parse(files)
        if (items.length > 0 && window.confirm(`${items.length} checkins found. Are you sure you want to replace currently stored ones?`)) {
            setCheckins(items)
            alert('Imported!')
        }
    })
}

const ButtonsContainer = styled('div')`
    display: flex;
    flex-direction: row;
`

const TextContainer = styled('div')`
    padding: 4px;
    margin-bottom: 12px;
    font-size: 14px;
`

function ButtonsPanel({ text, children, ...props }) {
    return <Panel {...props} spacing>
        {text ? <TextContainer>
            {text}
        </TextContainer> : null}
        <ButtonsContainer>
            {children}
        </ButtonsContainer>
    </Panel>
}

const ACCOUNT_COPY_AUTHED = "You can disconnect your foursquare account anytime. You will no longer be able to update checkin list, but your data will still be persisted."
const ACCOUNT_COPY_DEFAULT = "Once account is connected you will be able to fetch checkin data."


function FetchCheckinsPanel() {
    const [lastUpdated] = useLastUpdated()
    const title = lastUpdated ? `Checkins last updated on ${lastUpdated.format('DD/MM/YYYY')}` : 'Your data may be outdated...'
    return (
        <InfoPanel 
            style={{alignSelf:'flex-start'}}
            spacing
            title={title}
            image={<SquareImage src="/3d/beegarden1.png"/>}
        >
            <FetchCheckinsButton />
        </InfoPanel>
    )
}

export default function Swarm() {
    const isAuthenticated = useIsAuthenticated()
    const onLogout = useLogout()
    const onClearData = useClearData()
    const onDownloadCheckins = useDownloadCheckins()
    const onDownloadCategories = useDownloadCategories()
    const onImportCheckins = useImportCheckins()

    return (
        <Page header="Swarm">
            {isAuthenticated ? <FetchCheckinsPanel />  : null}
            <ButtonsPanel header="Connected account" text={isAuthenticated ? ACCOUNT_COPY_AUTHED : ACCOUNT_COPY_DEFAULT}>
                {isAuthenticated ? <Button onClick={onLogout} icon={IoLogoFoursquare}>Disconnect</Button> : <AuthenticateButton />}
            </ButtonsPanel>
            <ButtonsPanel header="Your data" text="All your checkins are stored in browsers local storage. You can create a backup or restore them anytime.">
                <Button onClick={onDownloadCheckins}>Download checkins.json</Button>
                <Separator />
                <Button onClick={onImportCheckins}>Import and replace checkins.json</Button>
                <Separator />
                <Button onClick={onClearData}>Clear all your foursquare data</Button>
            </ButtonsPanel>
            <ButtonsPanel header="Developer tools">
                <Button onClick={onDownloadCategories}>Download categories.json</Button>
            </ButtonsPanel>
        </Page>
    )
}

