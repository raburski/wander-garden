import { styled } from "goober"

const Container = styled('div')`
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 12px;
    padding-left: 16px;
    margin: 4px;
`

export default function NoneFound() {
    return <Container>None has been found...</Container>
}