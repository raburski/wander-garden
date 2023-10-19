import WebStoreButton from 'routes/Extension/WebStoreButton'
import Page from './Page'
import InfoPanel from 'components/InfoPanel'
import SquareImage from 'components/SquareImage'

const COPY = `You will need to install our browser extension. There are no other means of accessing your data on those websites other than directly extracting them through your browser.

The extension is safe, private and open source.`

const contentStyle = {paddingTop: 24, paddingBottom: 24}

export default function Extension() {
    return (
        <Page header="Browser extension" right="2 / 4">
            <InfoPanel image={<SquareImage src="/3d/puzzle.png" size={180}/>} contentStyle={contentStyle}>
                {COPY}
                <a target="_blank" href="https://github.com/raburski/wander-garden/tree/master/browser-extension">GitHub: Wander Garden browser extension</a>
                <WebStoreButton style={{alignSelf: 'center', marginTop: 22}}/>
            </InfoPanel>
        </Page>
    )
}