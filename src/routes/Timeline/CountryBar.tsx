import { Fragment } from 'react'
import GroupBar from "./GroupBar"
import type { GroupBarProps } from './GroupBar'

type Props = { name: string, children: JSX.Element, } & GroupBarProps
export default function CountryBar({ name, children, ...props }: Props) {
    return (
        <Fragment>
            <GroupBar title={name} {...props}></GroupBar>
            {children}
        </Fragment>
    )
}