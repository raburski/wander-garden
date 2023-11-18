import Base64 from "Base64"
import Button from "components/Button"
import { ModalPageButtons } from "components/ModalPage"
import Page from "components/Page"
import Panel from "components/Panel"
import { detectStayType, isStayData, useStartFileImport, useStays } from "domain/stays"
import toast from "react-hot-toast"
import { useParams, useSearchParams } from "react-router-dom"

export default function Stay() {
    const [params] = useSearchParams()
    const data = params.get('data')
    const stay = JSON.parse(Base64.decode(data))
    const startImport = useStartFileImport()

    if (isStayData(stay)) return null

    function importStay() {
        startImport(stay)
    }

    return (
        <Page header={stay.accomodation.name}>
            <Panel>
            {JSON.stringify(stay)}
            </Panel>
            <ModalPageButtons>
                <Button onClick={importStay}>Import stay</Button> 
            </ModalPageButtons>
        </Page>
    )
}