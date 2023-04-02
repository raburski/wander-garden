import { styled } from 'goober'
import colors from '../colors'

const BadgeContainerDefault = styled('div')`
    display: flex;
    flex-direction: column;
    padding: 8px;
    margin: 8px;
    align-items: center;
    border-radius: 6px;
    min-width: 72px;
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
        background-color: ${props => props.theme.primary.highlight};
    }
`

const BadgeIcon = styled('div')`
    display: flex;
    font-size: 48px;
`

const BadgeName = styled('div')`
    display: flex;
    font-size: 10px;
    color: ${props => props.theme.text};
`

function BadgeContainer({ active, inactive, ...props }) {
    if (active) {
        return <BadgeContainerActive {...props}/>
    } else if (inactive) {
        return <BadgeContainerInactive {...props}/>
    } else {
        return <BadgeContainerDefault {...props}/>
    }
}

export default function Badge({ name, emoji, active, inactive, onClick }) {
    return (
        <BadgeContainer active={active} inactive={inactive} onClick={onClick}>
            <BadgeIcon>{emoji}</BadgeIcon>
            <BadgeName>{name}</BadgeName>
        </BadgeContainer>
    )
}