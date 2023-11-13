import { MdCheckBoxOutlineBlank, MdCheckBox } from 'react-icons/md'
import InfoRow from "components/InfoRow"
import Panel from "components/Panel"
import { useState } from "react"
import { forwardRef, useImperativeHandle } from 'react'

export default forwardRef(function ({ items, onChange, onBlur, name, ...props }, ref) {
    const checkedIndexInit = [...items]

    // TODO: this could be problematic with form reset?
    const [checkedItems, setCheckedItems] = useState(checkedIndexInit)
    useImperativeHandle(ref, () => ({
        value: checkedItems,
        reset: () => setCheckedItems(checkedIndexInit)
    }), [checkedItems.length, setCheckedItems])

    const onItemClick = (item) => {
        const newValue = checkedItems.includes(item) ? checkedItems.filter(i => i !== item) : [...checkedItems, item]
        setCheckedItems(newValue)
        if (onChange) {
            onChange({ target: { value: newValue, name }})
        }
        if (onBlur) {
            onBlur({ target: { value: newValue, name }})
        }
    }
    return (
        <Panel {...props}>
            {items.map((item) => 
                <InfoRow 
                    icon={checkedItems.includes(item) ? MdCheckBox : MdCheckBoxOutlineBlank} 
                    title={item}
                    onClick={() => onItemClick(item)}
                />
            )}
        </Panel>
    )
})