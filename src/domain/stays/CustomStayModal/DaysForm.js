import { MdEdit,MdNightsStay, MdCheck } from 'react-icons/md'
import { useState } from "react"
import Button from "components/Button"
import moment from "moment"
import { forwardRef, useImperativeHandle } from 'react'
import { styled } from "goober"
import { getDaysAndRangeText, getDaysFromRange } from "date"
import PinButton from 'components/PinButton'
import MenuRow from "components/MenuRow"
import ListPicker from "./ListPickerForm"

const TextInlineButton = styled(PinButton)`
    display: inline;
    margin-left: 8px;
    margin-top: 2px;
`

export default forwardRef(function ({ since, until, onChange, name }, ref) {
    const [isEdittingDays, setEdittingDays] = useState(false)
    const days = getDaysFromRange(since, until)
    const formattedDays = days.map(day => moment(day).format('DD/MM/YYYY, dddd'))
    const [_, range] = getDaysAndRangeText(since, until)
    const [selectedDays, setSelectedDays] = useState(days)

    useImperativeHandle(ref, () => ({
        value: selectedDays,
        reset: () => setSelectedDays(undefined)
    }), [selectedDays])

    const onListChange = ({ target }) => {
        const values = target.value
        const actualValues = values.map(day => days[formattedDays.indexOf(day)])
        setSelectedDays(actualValues)
        onChange({ target: { value: actualValues, name }})
    }

    const onEditClick = () => {
        if (isEdittingDays) {
            setSelectedDays(days)
            onChange({ target: { value: days, name }})
        }
        setEdittingDays(!isEdittingDays)
    }

    return (
        <>
            <MenuRow
                icon={MdNightsStay}
                title="Nights stayed"
                right={
                    <>
                        {isEdittingDays ? null : range}
                        {days.length === 1 ? null : <TextInlineButton icon={MdEdit} onClick={onEditClick} style={{marginRight: -12, marginTop: -4, marginBottom: -2}} tooltipPosition="left" tooltipOffset={90} tooltip="Select dates"/>}
                    </>
                }
            />
            {isEdittingDays ? 
                <ListPicker items={formattedDays} onChange={onListChange} style={{marginLeft: 12, marginRight: 12, paddingBottom: 0}}/>
                : null
            }
        </>
    )
})
