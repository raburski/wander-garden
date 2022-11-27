import { styled } from "goober"

const Image = styled('img')`
    display: flex;
`

export default function SquareImage({ size = 120, ...props }) {
    const style = { width: size, height: size }
    return <Image style={style} {...props}/>
}