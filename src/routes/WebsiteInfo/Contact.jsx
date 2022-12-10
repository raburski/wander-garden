import Panel from '../../components/Panel'
import Button from '../../components/Button'
import { FiExternalLink } from 'react-icons/fi'

const COPY = `Wander Garden is currently developed and maintained by one soul only.
You can reach me through my website.

`

export default function Contact() {
    return (
        <Panel 
            contentStyle={{whiteSpace: 'pre-wrap'}}
            spacing
            header="Contact information"
        >
            {COPY}
            <Button style={{alignSelf: 'flex-start'}} icon={FiExternalLink} onClick={() => window.open('http://raburski.com')}>Open raburski.com</Button>
        </Panel>
    )
}