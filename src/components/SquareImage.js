import { styled } from "goober"

const Image = styled('img')`
    display: flex;
`

export default function SquareImage({ size = 150, style = {}, ...props }) {
    const _style = { width: size, height: size, ...style }
    return <Image style={_style} {...props}/>
}