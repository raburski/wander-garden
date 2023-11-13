import { ModalPageButtons } from "components/ModalPage"
import {  MdPeopleAlt } from 'react-icons/md'
import { PlaceTypeToIcon, StayPlaceType } from "../types"
import Panel from "components/Panel"
import Button from "components/Button"
import Separator from "components/Separator"
import { useForm } from "react-hook-form"
import { useAddCustomStays } from "../Context"
import MenuRow from "components/MenuRow"
import Page from "components/Page"
import { getStayIcon } from "../stays"
import InputRow from "components/InputRow"
import { IoMdPricetag } from "react-icons/io"
import DaysForm from "./DaysForm"
import { getDateRanges } from "date"

export default function ExtendStayPage({ phase, previousPhase, onFinished, ...props }) {    
    const { register, handleSubmit, formState } = useForm({ defaultValues: { totalGuests: previousPhase?.stay?.totalGuests } })
    const addCustomStays = useAddCustomStays()

    async function submitForm(state) {
        if (!state.days || state.days.length <= 0) return

        const dayRanges = getDateRanges(state.days)
        const stays = dayRanges.map(({ since, until }) => ({
            ...previousPhase.stay,
            since,
            until,
            placeType: StayPlaceType.Extension,
            price: state.price && !isNaN(state.price) ? { amount: parseFloat(state.price), currency: previousPhase.stay.price.currency } : undefined,
            totalGuests: !!state.totalGuests ? parseInt(state.totalGuests) : undefined
        }))
        await addCustomStays(stays)
        await onFinished()
    }

    const _onSubmit = handleSubmit(submitForm)

    return (
        <Page header="Extend stay" {...props}>
            <Panel>
                <MenuRow icon={getStayIcon(previousPhase.stay, previousPhase.stay.type)} title={previousPhase.stay.accomodation.name}/>
                <InputRow icon={IoMdPricetag} type="number" placeholder={`Price in ${previousPhase.stay.price.currency} for extended stay (optional)`} {...register('price')}/>
                <InputRow icon={MdPeopleAlt} type="number" placeholder="Total guests (optional)" {...register('totalGuests')}/>
                <DaysForm since={phase.since} until={phase.until} {...register('days', { required: true, minLength: 1 })}/>
            </Panel>
            
            <ModalPageButtons>
                <Separator />
                <Button icon={PlaceTypeToIcon[StayPlaceType.Extension]} disabled={formState.isSubmitting} onClick={_onSubmit}>Extend stay</Button>
            </ModalPageButtons>
        </Page>
    )
}