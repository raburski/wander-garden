import countryFlagEmoji from "country-flag-emoji"
import { Fragment } from 'react'
import { styled } from 'goober'
import { onlyUnique } from "../../array"
import Panel from "../../components/Panel"
import GroupBar from "./GroupBar"

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

export default function CountryBar({ name, children, onMoreClick, ...props }) {
    return (
        <Fragment>
            <GroupBar title={name} onMoreClick={onMoreClick} {...props}/>
            {children}
        </Fragment>
    )
}