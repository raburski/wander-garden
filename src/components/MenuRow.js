import InfoRow from "./InfoRow"

const STYLE = {padding: 12, paddingLeft: 14}
export default function MenuRow({ ...props }) {
    return <InfoRow iconSize={24} style={STYLE} {...props}/>
}