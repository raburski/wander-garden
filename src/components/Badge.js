import { styled } from 'goober'
import colors from '../colors'

const BadgeContainerDefault = styled('div')`
    display: flex;
    flex-direction: column;
    padding: 6px;
    margin: 4px;
    align-items: center;
    border-radius: 6px;
    min-width: ${props => props.small ? '54px;' : '72px'};
    cursor: pointer;

    &:hover {
        background-color: ${props => props.theme.background.highlight};
    }
`

const BadgeContainerInactive = styled(BadgeContainerDefault)`
    filter: grayscale(1);
    opacity: 0.6;
`

const BadgeContainerActive = styled(BadgeContainerDefault)`
    background-color: ${props => props.theme.background.highlight};

    &:hover {
        background-color: ${props => props.theme.primary.active};
    }
`

const BadgeContainerFilled = styled(BadgeContainerDefault)`
    background-color: ${props => props.theme.primary.active};
    outline: 2px dashed ${props => props.theme.primary.default};
    outline-offset: 2px;
    transition: 0.15s;

    &:hover {
        background-color: ${props => props.theme.background.default};
        transform: scale(1.06);
    }
`

const BadgeIcon = styled('div')`
    display: flex;
    font-size: ${props => props.small ? '32px' : '48px'};
`

const BadgeName = styled('div')`
    display: flex;
    font-size: 10px;
    color: ${props => props.theme.text};
`

function BadgeContainer({ active, inactive, filled, ...props }) {
    if (filled) {
        return <BadgeContainerFilled {...props}/>
    } else if (active) {
        return <BadgeContainerActive {...props}/>
    } else if (inactive) {
        return <BadgeContainerInactive {...props}/>
    } else {
        return <BadgeContainerDefault {...props}/>
    }
}

export default function Badge({ name, emoji, active, inactive, filled, onClick, small }) {
    return (
        <BadgeContainer active={active} inactive={inactive} filled={filled} onClick={onClick} small={small}>
            <BadgeIcon small={small}>{emoji}</BadgeIcon>
            <BadgeName>{name}</BadgeName>
        </BadgeContainer>
    )
}