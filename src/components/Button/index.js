import { styled } from 'goober'
import colors from '../../colors'

const EnabledButton = styled('button')`
    padding: 8px;
    padding-left: 16px;
    padding-right: 16px;
    border: 1px solid ${colors.border.normal};
    border-radius: 4px;
    background-color: ${colors.neutral.light};
    cursor: pointer;

    &:hover {
        background-color: ${colors.neutral.highlight};
    }
`

const DisabledButton = styled('button')`
    padding: 8px;
    padding-left: 16px;
    padding-right: 16px;
    border: 1px solid ${colors.border.normal};
    border-radius: 12px;
    background-color: ${colors.border.normal};
    color: white;
    cursor: default;
`

export default function Button({ disabled, ...props }) {
    return disabled ? <DisabledButton disabled {...props} /> : <EnabledButton {...props} />
}