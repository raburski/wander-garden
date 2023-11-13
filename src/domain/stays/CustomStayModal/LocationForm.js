import { MdCheck } from 'react-icons/md'
import { useState } from "react"
import Button from "components/Button"
import { forwardRef, useImperativeHandle } from 'react'
import { styled } from "goober"
import { LocationAccuracy, formattedAccuracyLocation, formattedLocation } from "domain/location"
import { getAddressComponents } from "domain/country"

import SearchPlaceForm from "./SearchPlaceForm"

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
            {options.map((o, i) => <ButtonOption key={o} icon={i === selectedIndex ? MdCheck : null} selected={i === selectedIndex} onClick={() => onOptionClick(o, i)}>{o}</ButtonOption>)}
            {children}
        </ButtonOptionsContainer>
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

export default forwardRef(function ({ presets = [], defaultLocation, onChange, name, icon, ...props }, ref) {
    const [selectedPresetIndex, setSelectedPresetIndex] = useState()
    const [selectedSearchPlace, setSelectedSearchPlace] = useState()
    const presetLabels = presets.map(formattedAccuracyLocation)
    const defaultLocationSelected = !selectedPresetIndex && !selectedSearchPlace

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
        onChange({ target: { value: locationFromMapsResult(result), name }})
    }

    const onSelectDefaultLocation = () => {
        setSelectedPresetIndex(undefined)
        setSelectedSearchPlace(undefined)
        onChange({ target: { value: defaultLocation, name }})
    }

    return (
        <LocationFormContainer>
            <SearchPlaceForm onSelect={onSearchResultClick} selectedResult={selectedSearchPlace}/>
            <LocationFormSuggestedContainer>
                {defaultLocation ? 
                    <Button style={{marginBottom: 4}} icon={defaultLocationSelected ? MdCheck : null} onClick={onSelectDefaultLocation} selected={defaultLocationSelected}>
                        {formattedLocation(defaultLocation)}
                    </Button> : null
                }
            </LocationFormSuggestedContainer>
            {presets.length === 0 ? null :
                <LocationFormSuggestedContainer>
                    <LocationFormSuggestionsLabel>Suggestions:</LocationFormSuggestionsLabel>
                    <ButtonOptions options={presetLabels} onOptionClick={onOptionClick} selectedIndex={selectedPresetIndex} />
                </LocationFormSuggestedContainer>
            }
        </LocationFormContainer>
    )
})