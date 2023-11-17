import Button from "components/Button"
import InputRow from "components/InputRow"
import Modal from "components/Modal"
import { ModalPageButtons } from "components/ModalPage"
import Page from "components/Page"
import Panel from "components/Panel"
import Separator from "components/Separator"
import { useSetTitle, useTitle } from "domain/titles"
import { useForm } from "react-hook-form"
import { MdCheck } from "react-icons/md"


export default function EditTitleModal({ onFinished, tripId, ...props }) {
    const title = useTitle(tripId)
    const setTitle = useSetTitle(tripId)

    const { register, handleSubmit } = useForm({ defaultValues: { title } })

    async function submitForm(state) {
        await setTitle(state.title)
        await onFinished()
    }

    const _onSubmit = handleSubmit(submitForm)

    return (
        <Modal onClickAway={onFinished} {...props}>
            <Page header="Change trip name" {...props}>
                <Panel >
                    <InputRow type="text" placeholder="Trip name" {...register('title')}/>
                </Panel>
                
                <ModalPageButtons>
                    <Separator />
                    <Button icon={MdCheck} onClick={_onSubmit}>Submit</Button>
                </ModalPageButtons>
            </Page>
        </Modal>
    )
}