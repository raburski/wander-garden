import { ModalPageButtons } from "components/ModalPage"
import { MdAdd, MdPeopleAlt, MdLocationPin, MdDone } from 'react-icons/md'
import { PlaceTypeToIcon, StayPlaceType } from "../types"
import Panel from "components/Panel"
import Button from "components/Button"
import Separator from "components/Separator"
import { useForm } from "react-hook-form"
import { LocationAccuracy, formattedAccuracyLocation } from "domain/location"
import { useAddCustomStays, useReplaceCustomStay } from "../Context"
import Page from "components/Page"
import InputRow from "components/InputRow"
import { IoMdPricetag } from "react-icons/io"
import LocationForm from "./LocationForm"
import DaysForm from "./DaysForm"
import { getDateRanges } from "date"
import { DEFAULT_HOME_LOCATION } from "../stays"

function getPresetLocations(phase) {
    if (!phase.stay) return []
    const locations = phase.guessedLocations.flatMap(l => [
        { ...l, accuracy: LocationAccuracy.City },
        { ...l, accuracy: LocationAccuracy.Country },
    ])
    locations.sort((l1, l2) => {
        if (l1.accuracy === l2.accuracy) return 0
        return l1.accuracy === LocationAccuracy.City ? -1 : 1
    })
    return locations.filter((location, i) => {
        const title = formattedAccuracyLocation(location)
        return locations.findIndex(loc => formattedAccuracyLocation(loc) === title) === i
    })
}

const HOME_NAME = 'My home'

function getFormDefaultValues(previousPhase, stay, isHome) {
    if (previousPhase) {
        return { totalGuests: previousPhase?.stay?.totalGuests, name: isHome ? HOME_NAME : undefined }
    } else if (stay) {
        return {
            name: isHome ? stay.accomodation.name : HOME_NAME,
            location: stay.location,
            totalGuests: stay.totalGuests
        }
    }
    return {}
}

export default function CustomStayPage({ phase, previousPhase, placeType, onFinished, stay, onBack, ...props }) {
    const isHome = placeType === StayPlaceType.Home

    const { register, handleSubmit, formState } = useForm({ defaultValues: getFormDefaultValues(previousPhase, stay, isHome) })
    const isEditing = !!stay
    
    const since = phase?.since || stay?.since
    const until = phase?.until || stay?.until

    const addCustomStays = useAddCustomStays()
    const replaceCustomStay = useReplaceCustomStay()
    const locations = phase ? getPresetLocations(phase) : []

    async function submitForm(state) {
        if (!state.name || !state.days) return
        if (!isHome && !state.location) return

        const dayRanges = getDateRanges(state.days)
        const stays = dayRanges.map(({ since, until }) => ({
            accomodation: {
                name: state.name
            },
            location: state.location || DEFAULT_HOME_LOCATION,
            since,
            until,
            placeType,
            price: state.price && !isNaN(state.price) ? { amount: parseFloat(state.price), currency: previousPhase.stay.price.currency } : undefined,
            totalGuests: !!state.totalGuests ? parseInt(state.totalGuests) : undefined
        }))
        if (stay) {
            await replaceCustomStay(stay.id, stays)
        } else {
            await addCustomStays(stays)
        }
        await onFinished()
    }

    const _onSubmit = handleSubmit(submitForm)

    return (
        <Page header={isEditing ? 'Edit stay' : 'Add stay'} onBack={isEditing ? null : onBack} {...props}>
            <Panel>
                <InputRow icon={PlaceTypeToIcon[placeType]} placeholder="Name" {...register('name', { required: true })}/>
                {!isHome && previousPhase?.stay?.price?.currency ? <InputRow icon={IoMdPricetag} type="number" placeholder={`Total price in ${previousPhase.stay.price.currency} (optional)`} {...register('price')}/> : null}
                {isHome ? null : <InputRow icon={MdPeopleAlt} type="number" placeholder="Total guests (optional)" {...register('totalGuests')}/>}
                {isHome ? null : <LocationForm icon={MdLocationPin} defaultLocation={stay?.location} presets={locations} {...register('location', { required: true })}/>}
                <DaysForm since={since} until={until} {...register('days', { required: true, minLength: 1 })}/>
            </Panel>
            <ModalPageButtons>
                <Separator />
                <Button icon={isEditing ? MdDone : MdAdd} onClick={_onSubmit} disabled={!formState.isValid || formState.isSubmitting}>{isEditing ? 'Submit changes' : 'Add custom stay'}</Button>
            </ModalPageButtons>
        </Page>
    )
}
