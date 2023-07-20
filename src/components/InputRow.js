import { styled } from 'goober'
import { Row } from './Panel'
import TextField from 'components/TextField'
import { forwardRef } from 'react'

const InputField = styled(TextField, forwardRef)`
    border: 0px;
    flex: 1;
    margin-top: -4px;
    margin-bottom: -4px;
    margin-right: -8px;
    margin-left: -8px;
    padding-left: 8px;
`

const InputRowContainer = styled(Row)`
    padding: 10px;
    padding-left: 14px;
    padding-right: 14px;
`

const Right = styled('div')`
    display: flex;
    align-items: center;
    margin-right: 6px;

    font-size: 14px;
    color: ${props => props.theme.text};
`

const IconContainer = styled('div')`
    display: flex;
    flex: 0;
    align-items: center;
    justify-content: center;
    margin-right: 14px;
    color: ${props => props.theme.text};
`


export default forwardRef(function InputRow({ icon, right, rightStyle, iconSize = 24, ...props }, ref) {
    const IconComponent = icon
    return (
        <InputRowContainer>
            {icon ? <IconContainer><IconComponent size={iconSize} /></IconContainer> : null}
            <InputField ref={ref} {...props}/>
            {right ? <Right style={rightStyle}>{right}</Right> : null}
        </InputRowContainer>
    )
})
