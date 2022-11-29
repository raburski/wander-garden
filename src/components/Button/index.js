import { styled } from 'goober'
import colors from '../../colors'

const defaultStyle = `
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;

    border: 1px solid ${colors.border.normal};
    border-radius: .5rem;
    font-family: "Inter var",ui-sans-serif,system-ui,-apple-system,system-ui,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";
    font-size: .875rem;
    font-weight: 600;
    line-height: 1.25rem;
    padding: .55rem .8rem;
    text-align: center;
    text-decoration: none #D1D5DB solid;
    text-decoration-thickness: auto;
`

const EnabledButton = styled('button')`
    ${defaultStyle}
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    background-color: white;
    color: black;
    cursor: pointer;

    &:hover {
        background-color: ${colors.neutral.highlight};
    }
`

const DisabledButton = styled('button')`
    ${defaultStyle}
    border: 1px solid ${colors.border.normal};
    background-color: ${colors.border.normal};
    color: #545454;
    cursor: default;
`

const IconContainer = styled('div')`
    display: flex;
    flex: 0;
    margin-right: .55rem;
    align-items: center;
    justify-content: center;
`

export default function Button({ disabled, icon, children, ...props }) {
    const Component = disabled ? DisabledButton : EnabledButton
    const IconComponent = icon
    return (
        <Component disabled={disabled} {...props}>
            {icon ? <IconContainer><IconComponent size={16} /></IconContainer> : null}
            {children}
        </Component>
    )
}