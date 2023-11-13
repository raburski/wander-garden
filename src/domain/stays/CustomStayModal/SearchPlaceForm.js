import { MdPlace, MdCheck } from 'react-icons/md'
import { useEffect, useRef, useState } from "react"
import Button from "components/Button"
import { styled } from "goober"
import InputRow from "components/InputRow"
import useDebouncedInput from "hooks/useDebouncedInput"

const SearchPlaceFormResultsContainer = styled('div')`
    margin-left: 48px;
    margin-bottom: 12px;
`

export default function SearchPlaceForm({ onSelect, selectedResult }) {
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
                        <Button style={{marginBottom: 4}} icon={selectedResult === result ? MdCheck : null} onClick={() => onSelect(result)} selected={selectedResult === result}>
                            {result.name}{"\n"}{result.formatted_address}
                        </Button>
                    )}
                </SearchPlaceFormResultsContainer>
            : null}
        </>
    )
}
