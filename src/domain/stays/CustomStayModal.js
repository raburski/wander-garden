import ModalPage, { ModalPageButtons } from "components/ModalPage"
import { MdHotel, MdSailing, MdAdd, MdCheckBoxOutlineBlank, MdCheckBox, MdEdit, MdAddTask, MdAddCircleOutline, MdNightsStay } from 'react-icons/md'
import { FaCouch, FaUserFriends, FaCaravan, FaCar, FaShip, FaDiscord } from 'react-icons/fa'
import { FiChevronRight, FiExternalLink } from 'react-icons/fi'
import { TbTent, TbCloudUpload, TbDots } from 'react-icons/tb'
import { PlaceTypeToIcon, PlaceTypeToTitle, StayPlaceType } from "./types"
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
import { openDiscord } from "SideBar"
import MenuRow from "components/MenuRow"
import { AnimatePresence } from 'framer-motion'
import Modal from "components/Modal"
import Page from "components/Page"
import Phase from "routes/Trip/Phase"
import { getStayIcon } from "./stays"

const ICONS = Object.values(PlaceTypeToIcon)

function WhatToDoOptionsPage({ onAddCustomStay, onUploadFile, onContactUs, onExtendStay, previousPhase, ...props }) {
    return (
        <Page header="What do we do?" {...props}>
            <Panel >
                <MenuRow icon={FaDiscord} onClick={onContactUs} title="Automatic import not working?" subtitle="Let us know on discord" rightIcon={FiExternalLink}/>
                <MenuRow icon={TbCloudUpload} onClick={onUploadFile} title="Your friend shared file with this stay?" subtitle="Import stay file"/>
                {previousPhase && onExtendStay ? <MenuRow icon={MdAddTask} onClick={onExtendStay} title="Stayed longer?" subtitle={`Extend your stay in ${previousPhase.stay.accomodation.name}`} rightIcon={FiChevronRight}/> : null}
                <MenuRow icon={MdAddCircleOutline} onClick={onAddCustomStay} title="Something else?" subtitle="Add custom stay" rightIcon={FiChevronRight}/>
            </Panel>
        </Page>
    )
}

function getDaysFromRange(since, until) {
    const start = moment(since)
    const end = moment(until)
    const numberOfDays = end.diff(start, 'days')
    return Array.from({length: numberOfDays}, (_, i) => moment(since).add(i, 'days').format())
}

const ListPicker = forwardRef(function ({ items, onChange, onBlur, name, ...props }, ref) {
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
        <Panel {...props}>
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
            {options.map((o, i) => <ButtonOption key={o} selected={i === selectedIndex} onClick={() => onOptionClick(o, i)}>{o}</ButtonOption>)}
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
        <MenuRow
            icon={MdNightsStay}
            title="Stayed nights between"
            right={<>{isEdittingDays ? null : range}{days.length === 1 ? null : <TextInlineButton icon={MdEdit} onClick={() => setEdittingDays(true)} tooltip="Select dates"/>}</>}
         />
            {isEdittingDays ? 
                <ListPicker items={days} onChange={onListChange} style={{marginLeft: 12, marginRight: 12, paddingBottom: 0}}/>
                : null
            }
        </>
    )
})

function ExtendStayPage({ phase, previousPhase, onFinished, ...props }) {    
    const { register, handleSubmit, formState } = useForm()
    const addCustomStays = useAddCustomStays()

    async function submitForm(state) {
        if (!state.days || state.days.length <= 0) return

        const dayRanges = getDateRanges(state.days)
        const stays = dayRanges.map(({ since, until }) => ({
            ...previousPhase.stay,
            since,
            until,
            placeType: StayPlaceType.Extension,
            price: undefined
        }))
        await addCustomStays(stays)
        await onFinished()
    }

    const _onSubmit = handleSubmit(submitForm)

    return (
        <Page header="Extend stay" {...props}>
            <Panel>
                <MenuRow icon={getStayIcon(previousPhase.stay, previousPhase.stay.type)} title={previousPhase.stay.accomodation.name}/>
                <DaysForm since={phase.since} until={phase.until} {...register('days', { required: true, minLength: 1 })}/>
            </Panel>
            
            <ModalPageButtons>
                <Separator />
                <Button icon={PlaceTypeToIcon[StayPlaceType.Extension]} disabled={formState.isSubmitting} onClick={_onSubmit}>Extend stay</Button>
            </ModalPageButtons>
        </Page>
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

function CustomStayPage({ phase, previousPhase, placeType, onFinished, ...props }) {
    const [isEdittingDetails, setEdittingDetails] = useState(false)
    
    const { register, handleSubmit, formState } = useForm()
    
    const addCustomStays = useAddCustomStays()
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
        await onFinished()
    }

    const _onSubmit = handleSubmit(submitForm)

    return (
        <Page header="Add stay" {...props}>
            <Panel>
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
                <DaysForm since={phase.since} until={phase.until} {...register('days', { required: true, minLength: 1 })}/>
            </Panel>
            <ModalPageButtons>
                <Separator />
                <Button icon={MdAddCircleOutline} onClick={_onSubmit} disabled={!formState.isValid || formState.isSubmitting}>Add custom stay</Button>
            </ModalPageButtons>
        </Page>
    )
}

function ChooseStayTypePage({ onPlaceTypeSelect, ...props }) {
    return (
        <Page header="Stay type" {...props}>
            <Panel>
            {Object.keys(PlaceTypeToTitle).map(type =>
                <MenuRow
                    key={type}
                    icon={PlaceTypeToIcon[type]}
                    title={PlaceTypeToTitle[type]}
                    onClick={() => onPlaceTypeSelect(type)}
                    rightIcon={FiChevronRight}
                />
            )}
            </Panel>
        </Page>
    )
}

const WIDTH = 480
export default function CustomStayModal({ onClickAway, phase, previousPhase, ...props }) {
    const [addStayConfirmed, setAddStayConfirmed] = useState(false)
    const [selectedStayType, setSelectedStayType] = useState(undefined)
    const uploadFile = useUpload()

    const cancel = () => {
        setAddStayConfirmed(false)
        setSelectedStayType(undefined)
        onClickAway()
    }

    const onAddCustomStay = () => setAddStayConfirmed(true)
    const onExtendStay = () => setSelectedStayType(StayPlaceType.Extension)
    const onContactUs = () => { openDiscord(); cancel() }
    const onUploadFile = () => { uploadFile(); cancel() }

    const onBackFromChoseStayType = () => setAddStayConfirmed(false)
    const onPlaceTypeSelect = type => setSelectedStayType(type)
    const onBackFromAddStay = () => setSelectedStayType(undefined)

    if (!phase) return null

    return (
        <Modal isOpen={!!phase}  onClickAway={cancel} {...props}>
            {!addStayConfirmed && !selectedStayType ? 
                <WhatToDoOptionsPage key="info" style={{ width: WIDTH, }} layout
                    previousPhase={previousPhase}
                    onAddCustomStay={onAddCustomStay}
                    onExtendStay={onExtendStay}
                    onContactUs={onContactUs}
                    onUploadFile={onUploadFile}
                /> : null
            }
            {addStayConfirmed && !selectedStayType ? 
                <ChooseStayTypePage
                    key="info"
                    style={{ width: WIDTH, }}
                    layout
                    onBack={onBackFromChoseStayType}
                    onPlaceTypeSelect={onPlaceTypeSelect}
                /> : null
            }
            {selectedStayType && selectedStayType === StayPlaceType.Extension ?
                <ExtendStayPage
                    key="info"
                    style={{ width: WIDTH, }}
                    layout
                    phase={phase}
                    previousPhase={previousPhase}
                    onFinished={cancel}
                    onBack={onBackFromAddStay}
                /> : null
            }
            {selectedStayType && selectedStayType !== StayPlaceType.Extension ?
                <CustomStayPage
                    key="info"
                    style={{ width: WIDTH, }}
                    layout
                    placeType={selectedStayType}
                    phase={phase}
                    previousPhase={previousPhase}
                    onFinished={cancel}
                    onBack={onBackFromAddStay}
                /> : null
            }
        </Modal>
    )
}