import { styled } from 'goober'

function getButtonBackground(props) {
    if (props.disabled) {
        return props.theme.background.highlight
    }
    if (props.selected) {
        return props.theme.background.highlight
    }
    return props.theme.background.default
}

function getButtonColor(props) {
    if (props.disbaled) { return '#545454' } 
    return props.theme.text
}

function getButtonHoverBackground(props) {
    if (props.disabled) {
        return props.theme.background.highlight
    }
    return props.primary ? props.theme.primary.highlight : props.theme.background.highlight
}

const ButtonContainer = styled('button')`
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
    align-self: flex-start;

    border: ${props => props.flat ? '0px' : '1px'} solid ${props => props.theme.border};
    border-radius: .5rem;
    font-family: "Inter var",ui-sans-serif,system-ui,-apple-system,system-ui,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";
    font-size: .875rem;
    font-weight: 600;
    line-height: 1.25rem;
    padding: .65rem .8rem;
    text-align: center;
    text-decoration: none #D1D5DB solid;
    text-decoration-thickness: auto;
    box-shadow: 0 ${props => props.disabled || props.flat ? '0px' : '2px'} 0px 0 ${props => props.theme.shadow};
    background-color: ${getButtonBackground};
    color: ${getButtonColor};
    cursor: ${props => props.disabled ? 'default' : 'pointer'};

    &:hover {
        background-color: ${getButtonHoverBackground};
    }
    &:active {
        box-shadow: 0 ${props => props.disabled ? '0px' : '1px'} 2px 0 ${props => props.theme.shadow} inset;
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

export default function Button({ disabled = false, icon = undefined, selected = false, iconSize = 16, children, onClick = () => {}, flat = false, ...props }) {
    const IconComponent = icon
    const noPropagateClick = (event) => {
        event.stopPropagation()
        onClick(event)
    }
    return (
        <ButtonContainer disabled={disabled} selected={selected} onClick={noPropagateClick} {...props}>
            {icon ? <IconContainer><IconComponent size={iconSize} /></IconContainer> : null}
            {icon && children ? <Separator /> : null}
            {children}
        </ButtonContainer>
    )
}