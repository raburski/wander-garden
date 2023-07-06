import { styled } from 'goober'
import useDebouncedState from 'hooks/useDebouncedState'
import { motion } from "framer-motion"

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
    position: relative;
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

const Tooltip = styled(motion.div)`
    position: absolute;
    z-index: 10;
    padding: 2px;
    padding-left: 6px;
    padding-right: 6px;
    background-color: ${props => props.theme.background.default};
    border-radius: 4px;
    border: 1px solid ${props => props.theme.border};
    box-shadow: 0 3px 5px 2px ${props => props.theme.shadow};
    font-size: 11px;
    pointer-events: none;
`

const TOOLTIP_POSITION = {
    LEFT: 'left',
    RIGHT: 'right',
    BOTTOM: 'bottom',
    TOP: 'top',
}

function getTooltipStyles(position, offset) {
    switch (position) {
        case TOOLTIP_POSITION.TOP:
            return [{ top: - offset/1.5, opacity: 0 }, { top: - offset, opacity: 1 }]
        case TOOLTIP_POSITION.BOTTOM:
            return [{ top: offset/1.5, opacity: 0 }, { top: offset, opacity: 1 }]
        case TOOLTIP_POSITION.LEFT:
            return [{ left: - offset/1.5, opacity: 0 }, { left: - offset, opacity: 1 }]
        case TOOLTIP_POSITION.RIGHT:
            return [{ right: - offset/1.5, opacity: 0 }, { right: - offset, opacity: 1 }]
        default:
            return [{}, {}]
    }
}

const TOOLTIP_TRANSITION = { duration: 0.1 }

export default function Button({ disabled = false, icon = undefined, selected = false, iconSize = 16, children, onClick = () => {}, flat = false, tooltip = null, tooltipOffset = 32, tooltipPosition = TOOLTIP_POSITION.TOP, ...props }) {
    const [isHover, setHover] = useDebouncedState(false, 400)
    const IconComponent = icon
    const noPropagateClick = (event) => {
        event.stopPropagation()
        onClick(event)
    }
    const tooltipText = tooltip && tooltip.replace(/ /g, '\u00a0')
    const [tooltipInitial, tooltipAnimate] = getTooltipStyles(tooltipPosition, tooltipOffset)
    const onMouseOver = () => setHover(true)
    const onMouseLeave = () => setHover(false, true)

    return (
        <ButtonContainer disabled={disabled} selected={selected} onClick={noPropagateClick} onMouseOver={onMouseOver} onMouseLeave={onMouseLeave} {...props}>
            {tooltip ? <Tooltip transition={TOOLTIP_TRANSITION} initial={tooltipInitial} animate={isHover ? tooltipAnimate : tooltipInitial}>{tooltipText}</Tooltip> : null}
            {icon ? <IconContainer><IconComponent size={iconSize} /></IconContainer> : null}
            {icon && children ? <Separator /> : null}
            {children}
        </ButtonContainer>
    )
}