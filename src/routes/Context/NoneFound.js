import { styled } from "goober"

const Container = styled('div')`
    display: flex;
    flex-direction: row;
    align-items: center;
    background-color: #fafafa;
    border: 1px solid #ebebeb;
    border-radius: 12px;
    padding: 12px;
    padding-left: 16px;
    margin: 4px;
`

export default function NoneFound() {
    return <Container>None has been found...</Container>
}