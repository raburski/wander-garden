import React, { FunctionComponent, InputHTMLAttributes } from 'react'
import { css } from 'goober'
import colors from 'colors'

const inputClass = css`
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-self: flex-start;

    border: 1px solid ${colors.border.normal};
    border-radius: .5rem;
    font-family: "Inter var",ui-sans-serif,system-ui,-apple-system,system-ui,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";
    font-size: .875rem;
    font-weight: 600;
    line-height: 1.25rem;
    padding: .55rem .8rem;
    text-decoration: none #D1D5DB solid;
    text-decoration-thickness: auto;

    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) inset;
    background-color: white;
    color: black;

    &:hover {
        background-color: ${colors.neutral.light};
    }
    &:active {
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) inset;
    }
`

export default function TextField({ ...props }) {
    return <input type="text" className={inputClass} {...props} />
}
