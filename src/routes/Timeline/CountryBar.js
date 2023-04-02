import { Fragment } from 'react'
import GroupBar from "./GroupBar"

export default function CountryBar({ name, children, ...props }) {
    return (
        <Fragment>
            <GroupBar title={name} {...props}></GroupBar>
            {children}
        </Fragment>
    )
}