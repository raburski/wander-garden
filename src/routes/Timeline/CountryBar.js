import { Fragment } from 'react'
import GroupBar from "./GroupBar"

export default function CountryBar({ name, children, onMoreClick, ...props }) {
    return (
        <Fragment>
            <GroupBar title={name} onMoreClick={onMoreClick} {...props}/>
            {children}
        </Fragment>
    )
}