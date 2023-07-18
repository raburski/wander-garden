import InfoRow from "./InfoRow"

const STYLE = {padding: 10, paddingLeft: 14, paddingRight: 14}
export default function MenuRow({ rightIcon, ...props }) {
    const RightIcon = rightIcon
    const right = rightIcon ? <RightIcon size={18} /> : null
    return <InfoRow iconSize={24} style={STYLE} right={right} {...props}/>
}