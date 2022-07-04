import { styled } from 'goober'
import colors from '../../colors'

export default styled('button')`
    padding: 8px;
    padding-left: 16px;
    padding-right: 16px;
    border: 1px solid ${colors.border.normal};
    border-radius: 12px;
    background-color: ${colors.neutral.light};
    cursor: pointer;

    &:hover {
        background-color: ${colors.neutral.highlight};
    }
`
