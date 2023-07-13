import ModalPage from "components/ModalPage"
import { MdHotel, MdSailing, MdAdd, MdCheckBoxOutlineBlank, MdCheckBox, MdEdit } from 'react-icons/md'
import { FaCouch, FaUserFriends, FaCaravan, FaCar, FaShip } from 'react-icons/fa'
import { FiExternalLink } from 'react-icons/fi'
import { TbTent, TbCloudUpload, TbDots } from 'react-icons/tb'
import { PlaceTypeToIcon, PlaceTypeToTitle } from "./types"
import InfoRow from "components/InfoRow"
import Panel from "components/Panel"
import { useState } from "react"
import Button from "components/Button"
import Separator from "components/Separator"
import { useUpload } from "routes/Data/hooks"
import TextField from "components/TextField"
import moment from "moment"
import { useForm } from "react-hook-form"
import { forwardRef, useImperativeHandle } from 'react'
import { styled } from "goober"
import { getDaysAndRangeText } from "date"
import PinButton from 'components/PinButton'
import { PhaseType } from "routes/Trip/useTrip"
import { LocationAccuracy, formattedAccuracyLocation } from "domain/location"
import { useAddCustomStays } from "./Context"


const ICONS = Object.values(PlaceTypeToIcon)

const PREFERRED_COPY_1 = `Automatic import not working?

`

const PREFERRED_COPY_2 = `
Your friend shared file with this stay?

`

const PREFERRED_COPY_3 = `
Otherwise...

⬅  Select type of the stay on the left panel.

`

function AccomodationInfoPanel() {
    const onContact = () => window.open('http://raburski.com')
    const uploadFile = useUpload()
    return (
        <>
            {PREFERRED_COPY_1}
            <Button icon={FiExternalLink} onClick={onContact}>Contact us</Button>
            {PREFERRED_COPY_2}
            <Button icon={TbCloudUpload} onClick={uploadFile}>Import from file</Button>
            {PREFERRED_COPY_3}
        </>
    )
}

function getDaysFromRange(since, until) {
    const start = moment(since)
    const end = moment(until)
    const numberOfDays = end.diff(start, 'days')
    return Array.from({length: numberOfDays}, (_, i) => moment(since).add(i, 'days').format())
}

const ListPicker = forwardRef(function ({ items, onChange, onBlur, name }, ref) {
    const checkedIndexInit = [...items]

    // TODO: this could be problematic with form reset?
    const [checkedItems, setCheckedItems] = useState(checkedIndexInit)
    useImperativeHandle(ref, () => ({
        value: checkedItems,
        reset: () => setCheckedItems(checkedIndexInit)
    }), [checkedItems.length, setCheckedItems])

    const onItemClick = (item) => {
        const newValue = checkedItems.includes(item) ? checkedItems.filter(i => i !== item) : [...checkedItems, item]
        setCheckedItems(newValue)
        if (onChange) {
            onChange({ target: { value: newValue, name }})
        }
        if (onBlur) {
            onBlur({ target: { value: newValue, name }})
        }
    }
    return (
        <Panel>
            {items.map((item) => 
                <InfoRow 
                    icon={checkedItems.includes(item) ? MdCheckBox : MdCheckBoxOutlineBlank} 
                    title={item}
                    onClick={() => onItemClick(item)}
                />
            )}
        </Panel>
    )
})

const ButtonOptionsContainer = styled('div')`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
`

const ButtonOption = styled(Button)`
    margin-right: 6px;
    margin-bottom: 6px;
`

const ButtonOptions = function ({ options = [], onOptionClick, children, selectedIndex }) {
    return (
        <ButtonOptionsContainer>
            {options.map((o, i) => <ButtonOption selected={i === selectedIndex} onClick={() => onOptionClick(o, i)}>{o}</ButtonOption>)}
            {children}
        </ButtonOptionsContainer>
    )
}

const StayTextField = styled(TextField, forwardRef)`
    flex: 1;
    margin-bottom: 6px;
    align-self: stretch;
`

const StayLabel = styled('span')`
    padding-bottom: 6px;
`

const TextInlineButton = styled(PinButton)`
    display: inline;
    margin-left: 8px;
    margin-top: 2px;
`

const InputInlineButton = styled(PinButton)`
    display: inline;
    margin-left: 12px;
    margin-top: 6px;
`

const ButtonInlineButton = styled(PinButton)`
    display: inline;
    margin-left: 8px;
    margin-top: 8px;
`

const FormLine = styled('div')`
    display: flex;
    align-self: stretch;
    flex-direction: row;
`

const LocationForm = forwardRef(function ({ presets = [], onChange, name }, ref) {
    const [isEditting, setEditting] = useState(false)
    const [selectedPresetIndex, setSelectedPresetIndex] = useState()
    const presetLabels = presets.map(formattedAccuracyLocation)
    
    useImperativeHandle(ref, () => ({
        value: selectedPresetIndex !== undefined ? presets[selectedPresetIndex] : undefined,
        reset: () => setSelectedPresetIndex(undefined)
    }), [selectedPresetIndex])

    const onOptionClick = (_, i) => {
        setSelectedPresetIndex(i)
        onChange({ target: { value: presets[selectedPresetIndex], name }})
    }
    return (
        <>
        <ButtonOptions options={presetLabels} onOptionClick={onOptionClick} selectedIndex={selectedPresetIndex}>
            {isEditting ? null : <ButtonInlineButton icon={MdEdit} onClick={() => setEditting(true)} tooltip="Precise edit"/>}
        </ButtonOptions>
        {isEditting ? 
            <>
                <StayTextField placeholder="Lat" />
                <StayTextField placeholder="Lng" />
            </>
        : null}
        </>
    )
})

const DaysForm = forwardRef(function ({ since, until, onChange, name }, ref) {
    const [isEdittingDays, setEdittingDays] = useState(false)
    const days = getDaysFromRange(since, until)
    const [_, range] = getDaysAndRangeText(since, until)
    const [selectedDays, setSelectedDays] = useState(days)

    useImperativeHandle(ref, () => ({
        value: selectedDays,
        reset: () => setSelectedDays(undefined)
    }), [selectedDays])

    const onListChange = ({ target }) => {
        const value = target.value
        setSelectedDays(value)
        onChange({ target: { value, name }})
    }

    return (
        <>
            <StayLabel>{days.length === 1 ? 'Night' : 'Nights'}: {isEdittingDays ? '' : <>{range} {days.length === 1 ? null : <TextInlineButton icon={MdEdit} onClick={() => setEdittingDays(true)} tooltip="Select dates"/>}</>}</StayLabel>
            {isEdittingDays ? 
                <ListPicker items={days} onChange={onListChange}/>
                : null
            }
        </>
    )
})

function CustomStayForm({ placeType, since, until, locations, onSubmit }) {
    const [isEdittingDetails, setEdittingDetails] = useState(false)
    
    const { register, handleSubmit, formState } = useForm()
    const _onSubmit = handleSubmit(onSubmit)

    return (
        <>
            <StayLabel>Stay:</StayLabel>
            <FormLine>
                <StayTextField placeholder="Name" {...register('name', { required: true })}/>
                {isEdittingDetails ? null : <InputInlineButton icon={TbDots} onClick={() => setEdittingDetails(true)} tooltip="Add more details" tooltipPosition="left"/>}
            </FormLine>
            {isEdittingDetails ? 
                <>
                    <StayTextField type="number" placeholder="Price (optional)" {...register('price')}/>
                    <StayTextField type="number" placeholder="Total people (optional)" {...register('totalGuests')}/>
                    
                </>
            : null}
            <Separator/>
            <StayLabel>Location:</StayLabel>
            <LocationForm presets={locations} {...register('location', { required: true })}/>
            <Separator/>
            <DaysForm since={since} until={until} {...register('days', { required: true, minLength: 1 })}/>
            <Separator />
            <Button onClick={_onSubmit} disabled={!formState.isValid}>Add custom stay</Button>
        </>
    )
}

function getPresetLocations(phase) {
    if (phase.type !== PhaseType.Unknown) return []
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

function getDateRanges(dates) {
    // Sort the dates in ascending order
    const sortedDates = dates
        .map(date => moment(date))
        .sort((a, b) => a.diff(b))
  
    const dateRanges = [];
    let rangeStart = null;
    let rangeEnd = null;
  
    sortedDates.forEach((date, index) => {
      const currentDate = date
  
      if (rangeStart === null) {
        // Start a new range
        rangeStart = currentDate;
        rangeEnd = currentDate;
      } else {
        // const nextDate = sortedDates[index + 1]
  
        if (currentDate.diff(rangeEnd, 'days') === 1) {
          // Extend the range if the next date is adjacent
          rangeEnd = currentDate;
        } else {
          // Add the current range and start a new one
          dateRanges.push({
            since: rangeStart.format(),
            until: rangeEnd.add(1, 'day').format()
          });
  
          rangeStart = currentDate;
          rangeEnd = currentDate;
        }
      }
    })

    if (rangeStart && rangeEnd) {
        dateRanges.push({
            since: rangeStart.format(),
            until: rangeEnd.add(1, 'day').format()
        })
    }
  
    return dateRanges
}

export default function CustomStayModal({ onClickAway, phase, ...props }) {
    const [placeType, setPlaceType] = useState()
    const addCustomStays = useAddCustomStays()
    const cancel = () => {
        setPlaceType(undefined)
        onClickAway()
    }

    const locations = phase ? getPresetLocations(phase) : []
    async function submitForm(state) {
        if (!state.name || !state.location || !state.days) return

        const dayRanges = getDateRanges(state.days)
        const stays = dayRanges.map(({ since, until }) => ({
            accomodation: {
                name: state.name
            },
            location: state.location,
            since,
            until,
            placeType,
        }))
        await addCustomStays(stays)
        cancel()
    }

    return (
        <ModalPage header="Add custom stay" isOpen={!!phase} pageStyle={{ width: 520, minHeight: 420 }} onClickAway={cancel} {...props}>
            <Panel contentStyle={{flexDirection: 'row', flex: 1}} style={{flex: 1}}>
                <Panel.Left>
                    {Object.keys(PlaceTypeToIcon).map(type =>
                        <InfoRow
                            selected={placeType === type}
                            icon={PlaceTypeToIcon[type]}
                            title={PlaceTypeToTitle[type]}
                            onClick={() => setPlaceType(type)}
                        />
                    )}
                </Panel.Left>
                <Panel.Right>
                        {placeType && phase ? 
                            <CustomStayForm placeType={placeType} since={phase.since} until={phase.until} locations={locations} onSubmit={submitForm}/> :
                            <AccomodationInfoPanel />}
                </Panel.Right>
            </Panel>
        </ModalPage>
    )
}