import ModalPage, { ModalPageButtons } from "components/ModalPage"
import { MdHotel, MdSailing, MdAdd, MdCheckBoxOutlineBlank, MdCheckBox, MdEdit, MdAddTask, MdAddCircleOutline, MdNightsStay, MdPeopleAlt, MdLocationPin, MdPlace, MdSearch } from 'react-icons/md'
import { FaCouch, FaUserFriends, FaCaravan, FaCar, FaShip, FaDiscord } from 'react-icons/fa'
import { FiChevronRight, FiExternalLink } from 'react-icons/fi'
import { TbTent, TbCloudUpload, TbDots, TbFriends } from 'react-icons/tb'
import { PlaceTypeToIcon, PlaceTypeToTitle, StayPlaceType } from "./types"
import InfoRow from "components/InfoRow"
import Panel, { Row } from "components/Panel"
import { useEffect, useRef, useState } from "react"
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
import InputRow from "components/InputRow"
import { IoMdPricetag } from "react-icons/io"
import { useNavigate } from "react-router"
import { RxFileText } from "react-icons/rx"
import useDebouncedInput from "hooks/useDebouncedInput"
import { getAddressComponents } from "domain/country"

const ICONS = Object.values(PlaceTypeToIcon)

function WhatToDoOptionsPage({ onAddCustomStay, onImportFromFriend, onContactUs, onExtendStay, previousPhase, ...props }) {
    return (
        <Page header="What do we do?" {...props}>
            <Panel >
                <MenuRow icon={FaDiscord} onClick={onContactUs} title="Automatic import not working?" subtitle="Let us know on discord" rightIcon={FiExternalLink}/>
                <MenuRow icon={FaUserFriends} onClick={onImportFromFriend} title="Your friend booked this stay?" subtitle="Import their data" rightIcon={FiChevronRight}/>
                {previousPhase && onExtendStay ? <MenuRow icon={MdAddTask} onClick={onExtendStay} title="Stayed longer?" subtitle={`Extend your stay in ${previousPhase.stay.accomodation.name}`} rightIcon={FiChevronRight}/> : null}
                <MenuRow icon={MdAddCircleOutline} onClick={onAddCustomStay} title="Something else?" subtitle="Add custom stay" rightIcon={FiChevronRight}/>
            </Panel>
        </Page>
    )
}

function getDaysFromRange(since, until) {
    const start = moment(since).startOf('day')
    const end = moment(until).startOf('day')
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
    margin-bottom: 4px;
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

const SearchPlaceFormResultsContainer = styled('div')`
    margin-left: 48px;
    margin-bottom: 12px;
`

function SearchPlaceForm({ onSelect, selectedResult }) {
    const ref = useRef()
    const [value, onChange] = useDebouncedInput(800)
    const [searchResults, setSearchResults] = useState()

    useEffect(() => {
        if (!value) return

        const placesService = new window.google.maps.places.PlacesService(ref.current)
        placesService.findPlaceFromQuery({
            query: value,
            fields: ['name', 'geometry', 'formatted_address']}, 
            results => {
                setSearchResults(results)
            }
        )
        
    }, [value])

    return (
        <>
            <div ref={ref} id="places_search_map" style={{width:0, height:0}}/>
            <InputRow icon={MdPlace} type="text" placeholder="Search with place adress or name" onChange={onChange}/>
            {value && searchResults ? 
                <SearchPlaceFormResultsContainer>
                    {searchResults.map(result => 
                        <Button style={{marginBottom: 4}} onClick={() => onSelect(result)} selected={selectedResult === result}>
                            {result.name}{"\n"}{result.formatted_address}
                        </Button>
                    )}
                </SearchPlaceFormResultsContainer>
            : null}
        </>
    )
}

const LocationFormContainer = styled('div')`
    display: flex;
    flex-direction: column;
`

const LocationFormSuggestedContainer = styled('div')`
    display: flex;
    flex-direction: column;
    margin-left: 48px;
    margin-bottom: 8px;
`

const LocationFormSuggestionsLabel = styled('div')`
    font-size: 12px;
    padding-bottom: 6px;
    color: ${props => props.theme.text};
`

function locationFromMapsResult(place) {
    if (!place) return undefined
    return {
        ...getAddressComponents(place.formatted_address),
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        accuracy: LocationAccuracy.GPS,
    }
}

const LocationForm = forwardRef(function ({ presets = [], onChange, name, icon, ...props }, ref) {
    const [selectedPresetIndex, setSelectedPresetIndex] = useState()
    const [selectedSearchPlace, setSelectedSearchPlace] = useState()
    const presetLabels = presets.map(formattedAccuracyLocation)
    
    useImperativeHandle(ref, () => ({
        value: selectedPresetIndex !== undefined ? presets[selectedPresetIndex] : locationFromMapsResult(selectedSearchPlace),
        reset: () => {
            setSelectedPresetIndex(undefined)
            setSelectedSearchPlace(undefined)
        }
    }), [selectedPresetIndex, selectedSearchPlace])

    const onOptionClick = (_, i) => {
        setSelectedPresetIndex(i)
        setSelectedSearchPlace(undefined)
        onChange({ target: { value: presets[selectedPresetIndex], name }})
    }
    
    const onSearchResultClick = (result) => {
        setSelectedSearchPlace(result)
        setSelectedPresetIndex(undefined)
    }

    return (
        <LocationFormContainer>
            <SearchPlaceForm onSelect={onSearchResultClick} selectedResult={selectedSearchPlace}/>
            {presets.length === 0 ? null :
                <LocationFormSuggestedContainer>
                    <LocationFormSuggestionsLabel>Suggestions:</LocationFormSuggestionsLabel>
                    <ButtonOptions options={presetLabels} onOptionClick={onOptionClick} selectedIndex={selectedPresetIndex} />
                </LocationFormSuggestedContainer>
            }
        </LocationFormContainer>
    )
})

const DaysForm = forwardRef(function ({ since, until, onChange, name }, ref) {
    const [isEdittingDays, setEdittingDays] = useState(false)
    const days = getDaysFromRange(since, until)
    const formattedDays = days.map(day => moment(day).format('DD/MM/YYYY, dddd'))
    const [_, range] = getDaysAndRangeText(since, until)
    const [selectedDays, setSelectedDays] = useState(days)

    useImperativeHandle(ref, () => ({
        value: selectedDays,
        reset: () => setSelectedDays(undefined)
    }), [selectedDays])

    const onListChange = ({ target }) => {
        const values = target.value
        const actualValues = values.map(day => days[formattedDays.indexOf(day)])
        setSelectedDays(actualValues)
        onChange({ target: { value: actualValues, name }})
    }

    const onEditClick = () => {
        if (isEdittingDays) {
            setSelectedDays(days)
            onChange({ target: { value: days, name }})
        }
        setEdittingDays(!isEdittingDays)
    }

    return (
        <>
            <MenuRow
                icon={MdNightsStay}
                title="Nights stayed"
                right={
                    <>
                        {isEdittingDays ? null : range}
                        {days.length === 1 ? null : <TextInlineButton icon={MdEdit} onClick={onEditClick} style={{marginRight: -12, marginTop: -4, marginBottom: -2}} tooltip="Select dates"/>}
                    </>
                }
            />
            {isEdittingDays ? 
                <ListPicker items={formattedDays} onChange={onListChange} style={{marginLeft: 12, marginRight: 12, paddingBottom: 0}}/>
                : null
            }
        </>
    )
})

function ExtendStayPage({ phase, previousPhase, onFinished, ...props }) {    
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
    const { register, handleSubmit, formState } = useForm({ defaultValues: { totalGuests: previousPhase?.stay?.totalGuests } })
    
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
            price: state.price && !isNaN(state.price) ? { amount: parseFloat(state.price), currency: previousPhase.stay.price.currency } : undefined,
            totalGuests: !!state.totalGuests ? parseInt(state.totalGuests) : undefined
        }))
        await addCustomStays(stays)
        await onFinished()
    }

    const _onSubmit = handleSubmit(submitForm)

    return (
        <Page header="Add stay" {...props}>
            <Panel>
                <InputRow icon={PlaceTypeToIcon[placeType]} placeholder="Name" {...register('name', { required: true })}/>
                {previousPhase?.stay?.price?.currency ? <InputRow icon={IoMdPricetag} type="number" placeholder={`Total price in ${previousPhase.stay.price.currency} (optional)`} {...register('price')}/> : null}
                <InputRow icon={MdPeopleAlt} type="number" placeholder="Total guests (optional)" {...register('totalGuests')}/>
                <LocationForm icon={MdLocationPin} presets={locations} {...register('location', { required: true })}/>
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

function UploadFromFriend({ onFinished, ...props }) {
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

const WIDTH = 500
export default function CustomStayModal({ onClickAway, phase, previousPhase, ...props }) {
    const [addStayConfirmed, setAddStayConfirmed] = useState(false)
    const [uploadFromFriendConfirmed, setUploadFromFriendConfirmed] = useState(false)
    const [selectedStayType, setSelectedStayType] = useState(undefined)
    

    const cancel = () => {
        setAddStayConfirmed(false)
        setUploadFromFriendConfirmed(false)
        setSelectedStayType(undefined)
        onClickAway()
    }

    const onAddCustomStay = () => setAddStayConfirmed(true)
    const onExtendStay = () => setSelectedStayType(StayPlaceType.Extension)
    const onContactUs = () => { openDiscord(); cancel() }
    const onImportFromFriend = () => setUploadFromFriendConfirmed(true)

    const onBackFromChoseStayType = () => setAddStayConfirmed(false)
    const onPlaceTypeSelect = type => setSelectedStayType(type)
    const onBackFromAddStay = () => setSelectedStayType(undefined)
    const onBackFromFriend = () => setUploadFromFriendConfirmed(false)

    if (!phase) return null

    return (
        <Modal isOpen={!!phase}  onClickAway={cancel} {...props}>
            {!addStayConfirmed && !selectedStayType && !uploadFromFriendConfirmed ? 
                <WhatToDoOptionsPage key="info" style={{ width: WIDTH, }} layout
                    previousPhase={previousPhase}
                    onAddCustomStay={onAddCustomStay}
                    onExtendStay={onExtendStay}
                    onContactUs={onContactUs}
                    onImportFromFriend={onImportFromFriend}
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
            {uploadFromFriendConfirmed ?
                <UploadFromFriend
                    key="info"
                    style={{ width: WIDTH, }}
                    layout
                    onBack={onBackFromFriend}
                    onFinished={cancel}
                /> : null 
            }
        </Modal>
    )
}