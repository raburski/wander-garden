import countryFlagEmoji from "country-flag-emoji"
import { styled } from 'goober'
import { onlyUnique } from "../../array"
import Panel from "../../components/Panel"

const Container = styled('div')`
    display: flex;
    flex-direction: column;
    background-color: white;
    border: 1px solid #ebebeb;
    border-radius: 12px;
    padding-left: 12px;
    margin: 4px;
`

const Header = styled('div')`
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-left: 12px;
`

const Flag = styled('div')`
    font-size: 32px;
    margin-right: 12px;
`

const Name = styled('div')`
    font-size: 18px;
    font-weight: bold;
    margin-right: 24px;
`

const States = styled('div')`
    font-size: 32px;
    margin-right: 12px;
    font-size: 14px;
    color: #4f4f4f;
`

const Icons = styled('div')`
    display: flex;
    flex-direction: row;
    margin-left: 46px;
    margin-bottom: 12px;
`

const StyledIcon = styled('div')`
    font-size: 16px;
    margin-right: 2px;
    cursor: default;
`

function Icon({ category }) {
    return <StyledIcon title={category.name}>{category.emoji}</StyledIcon>
}

export default function CountryBar({ name, code, states = [], children, categories = [] }) {
    const joinedStates = states.filter(Boolean).filter(onlyUnique).join(', ')
    return (
        <Panel>
            <Header><Flag>{countryFlagEmoji.get(code).emoji}</Flag> <Name>{name}</Name><States>{joinedStates}</States></Header>
            {children}
            {categories.length > 0 ? <Icons>{categories.map(c => <Icon category={c} key={c.id}/>)}</Icons> : null}
        </Panel>
    )
}