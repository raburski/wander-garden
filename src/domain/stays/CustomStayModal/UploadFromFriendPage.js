import { MdHotel } from 'react-icons/md'
import Panel, { Row } from "components/Panel"
import Button from "components/Button"
import { styled } from "goober"
import Page from "components/Page"
import { useNavigate } from "react-router"
import { RxFileText } from "react-icons/rx"

const SectionRow = styled(Row)`
    flex-direction: column;
    align-items: center;
    padding-left: 32px;
    padding-right: 32px;
    padding-bottom: 32px;
`

const SectionButtom = styled(Button)`
    margin-top: 28px;
    align-self: center;
`

const FRIENDS_ACCOUNT_COPY = `You can import stays from your friends Airbnb or Booking. 
You will have to ask for their passwords and use them to log in during capture process.

Remember to log out from your account first, before you start the process!
`

const IMPORT_STAY_COPY = `Your friend can use Wander Garden to import their stays. Then they can send you a stay file. 
Those can be exported and imported in the Data section.
`

export default function UploadFromFriendPage({ onFinished, ...props }) {
    const navigate = useNavigate()
    const onUploadFile = () => navigate('/data')
    const onGoToStays = () => navigate('/stays')
    return (
        <Page header="Import from friend" {...props}>
            <Panel>
                <SectionRow>
                    <h2>Use friends account</h2>
                    {FRIENDS_ACCOUNT_COPY}
                    <SectionButtom icon={MdHotel} onClick={onGoToStays}>Go to stays</SectionButtom>
                </SectionRow>
                <SectionRow>
                    <h2>Import stay file</h2>
                    {IMPORT_STAY_COPY}
                    <SectionButtom icon={RxFileText} onClick={onUploadFile}>Go to data</SectionButtom>
                </SectionRow>
            </Panel>
        </Page>
    )
}
