import { styled } from 'goober'
import { forwardRef } from 'react'

const InputOrTextarea = forwardRef(({ type, ...props }, ref) => {
    if (type === 'textarea') {
        return <textarea ref={ref} rows="6" {...props}/>
    } else {
        return <input ref={ref} {...props}/>
    }
})

const Input = styled(InputOrTextarea, forwardRef)`
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-self: flex-start;

    border: 1px solid ${props => props.theme.border};
    border-radius: .5rem;
    font-family: "Inter var",ui-sans-serif,system-ui,-apple-system,system-ui,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";
    font-size: .875rem;
    font-weight: 600;
    line-height: 1.25rem;
    padding: .55rem .8rem;
    text-decoration: none #D1D5DB solid;
    text-decoration-thickness: auto;

    box-shadow: 0 1px 2px 0 ${props => props.theme.shadow} inset;
    background-color: ${props => props.theme.background.default};
    color: ${props => props.theme.text};

    &:hover {
        background-color: ${props => props.theme.background.highlight};
    }
    &:active {
        box-shadow: 0 1px 2px 0 ${props => props.theme.shadow} inset;
    }
`

export default Input
