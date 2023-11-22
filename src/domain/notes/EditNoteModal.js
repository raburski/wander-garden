import Button from "components/Button";
import ModalPage, { ModalPageButtons } from "components/ModalPage";
import Separator from "components/Separator";
import { useForm } from "react-hook-form";
import { MdBookmarkBorder, MdDone, MdOutlineSubtitles } from "react-icons/md";
import { useSaveNote, useSubjectNote } from "./Context";
import Panel from "components/Panel";
import InputRow from "components/InputRow";
import toast from "react-hot-toast";

export default function EditNoteModal({ subjectId, onCancel, onFinished, ...props }) {
    const note = useSubjectNote(subjectId)
    const saveNote = useSaveNote()

    const { register, handleSubmit, formState } = useForm({ defaultValues: { text: note?.text, highlight: note?.highlight } })

    async function submitForm(state) {
        const updatedNote = {
            ...(note || { subjectId }),
            ...state,
        }
        await saveNote(updatedNote)
        await onFinished()
        toast.success('Note saved!')
    }

    const _onSubmit = handleSubmit(submitForm)

    return (
        <ModalPage header="Note" isOpen={!!subjectId} onClickAway={onCancel} pageStyle={{minWidth:420}} {...props}>
            <Panel>
                <InputRow icon={MdBookmarkBorder} placeholder="Highlight" {...register('highlight')}/>
                <InputRow icon={MdOutlineSubtitles} type="textarea" placeholder="Your story goes here..." {...register('text')}/>
            </Panel>
            <ModalPageButtons>
                <Separator />
                <Button icon={MdDone} onClick={_onSubmit} disabled={!formState.isValid || formState.isSubmitting}>Save</Button>
            </ModalPageButtons>
        </ModalPage>
    )
}