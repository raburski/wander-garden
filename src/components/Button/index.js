import { styled } from 'goober'
import colors from '../../colors'

const ButtonContainer = styled('button')`
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
    align-self: flex-start;

    border: 1px solid ${props => props.theme.border};
    border-radius: .5rem;
    font-family: "Inter var",ui-sans-serif,system-ui,-apple-system,system-ui,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";
    font-size: .875rem;
    font-weight: 600;
    line-height: 1.25rem;
    padding: .65rem .8rem;
    text-align: center;
    text-decoration: none #D1D5DB solid;
    text-decoration-thickness: auto;
    box-shadow: 0 2px 0px 0 ${props => props.theme.shadow};
    background-color: ${props => props.disabled ? props.theme.background.active : ( props.selected ? props.theme.background.highlight : props.theme.background.default)};
    color: ${props => props.disbaled ? '#545454' : props.theme.text};
    cursor: ${props => props.disabled ? 'default' : 'pointer'};

    &:hover {
        background-color: ${props => props.theme.background.highlight};
    }
    &:active {
        box-shadow: 0 1px 2px 0 ${props => props.theme.shadow} inset;
    }
`

const IconContainer = styled('div')`
    display: flex;
    flex: 0;
    align-items: center;
    justify-content: center;
`

const Separator = styled('div')`
    width: .55rem;
`

const selectedStyle = { backgroundColor: colors.neutral.highlight }

export default function Button({ disabled = false, icon = undefined, selected = false, children, onClick = () => {}, ...props }) {
    const IconComponent = icon
    const noPropagateClick = (event) => {
        event.stopPropagation()
        onClick(event)
    }
    return (
        <ButtonContainer disabled={disabled} selected={selected} onClick={noPropagateClick} {...props}>
            {icon ? <IconContainer><IconComponent size={16} /></IconContainer> : null}
            {icon && children ? <Separator /> : null}
            {children}
        </ButtonContainer>
    )
}