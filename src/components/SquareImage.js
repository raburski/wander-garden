import { styled } from "goober"

const Image = styled('img')`
    display: flex;
    width: 150px;
    height: 150px;
`

export default function SquareImage({ size, style = {}, ...props }) {
    const _style = size ? { width: size, height: size, ...style } : style
    return <Image style={_style} {...props}/>
}