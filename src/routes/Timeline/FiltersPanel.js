import { styled } from 'goober'
import countryFlagEmoji from "country-flag-emoji"
import Panel from "components/Panel"
import Segment from "components/Segment"
import FlagButton from "./FlagButton"

const AllFlagsContainer = styled('div')`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
`

const OptionsContainer = styled('div')`
    display: flex;
    flex-direction: row;
`

function AllFlags({ countryCodes = [], selectedCountryCode }) {
    return <AllFlagsContainer>{countryCodes.map(cc => <FlagButton key={cc} to={selectedCountryCode === cc.toLowerCase() ? `?` : `?cc=${cc.toLowerCase()}`} selected={selectedCountryCode == cc.toLowerCase()}>{countryFlagEmoji.get(cc).emoji}</FlagButton>)}</AllFlagsContainer>
}

const SEGMENT_TITLES = ['all', 'trips', 'abroad']

export default function FiltersPanel({ countryCodes, selectedCountryCode, selectedSegmentIndex, onSetSegmentIndex, ...props  }) {
    return (
        <Panel spacing {...props}>
            <AllFlags countryCodes={countryCodes} selectedCountryCode={selectedCountryCode}/>
            {/* <OptionsContainer>
                <Segment titles={SEGMENT_TITLES} selectedIndex={selectedSegmentIndex} onClick={onSetSegmentIndex}/>
            </OptionsContainer> */}
        </Panel>
    )
}