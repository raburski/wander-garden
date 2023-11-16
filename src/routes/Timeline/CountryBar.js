import { Fragment } from 'react'
import GroupBar from "./GroupBar"

export default function CountryBar({ name, countryCodes, children, ...props }) {
    return (
        <Fragment>
            <GroupBar title={name} countryCodes={countryCodes} {...props}></GroupBar>
            {children}
        </Fragment>
    )
}