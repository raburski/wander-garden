import { styled } from 'goober'

const Container = styled('div')`
    display: flex;
    flex-direction: row;
    padding: 14px;
`

const Name = styled('div')`
    padding-left: 18px;
    padding-top: 6px;
    text-align: center;

    font-family: "Courier Prime";
    font-weight: bolder;
    font-size: 30px;
    color: black;
`

const Icon = styled('div')`
    height: 44px;
    width: 44px;

    background-image: url(/bcg2.png);
    background-repeat: no-repeat;
    background-size: cover;

    border-radius: 10px;
`

export default function Logo() {
    return <Container><Icon /><Name>Wander</Name></Container>
}

