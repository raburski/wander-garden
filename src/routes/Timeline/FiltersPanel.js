import { styled } from 'goober'
import countryFlagEmoji from "country-flag-emoji"
import Panel from "components/Panel"
import FlagButton from "./FlagButton"
import Button from 'components/Button'
import { isDEV } from 'environment'
import useRefresh from 'domain/refresh'

const AllFlagsContainer = styled('div')`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
`

function AllFlags({ countryCodes = [], selectedCountryCode }) {
    return (
        <AllFlagsContainer>
            {countryCodes.map(cc => 
                <FlagButton key={cc} to={selectedCountryCode === cc.toLowerCase() ? `?` : `?cc=${cc.toLowerCase()}`} selected={selectedCountryCode == cc.toLowerCase()}>
                    {countryFlagEmoji.get(cc).emoji}
                </FlagButton>
            )}
        </AllFlagsContainer>
    )
}

export default function FiltersPanel({ countryCodes, selectedCountryCode, selectedSegmentIndex, onSetSegmentIndex, ...props  }) {
    const refresh = useRefresh()
    return (
        <Panel spacing {...props}>
            <AllFlags countryCodes={countryCodes} selectedCountryCode={selectedCountryCode}/>
            {isDEV() ? <Button onClick={refresh}>Refresh</Button> : null}
        </Panel>
    )
}