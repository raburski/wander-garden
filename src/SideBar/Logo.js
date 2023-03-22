import { styled } from 'goober'

const Container = styled('div')`
    display: flex;
    flex-direction: row;
    justify-content: center;
    padding: 14px;
`

const Name = styled('div')`
    padding-left: 0px;

    padding-top: 8px;
    text-align: center;

    font-family: Logo;
    font-weight: bolder;
    font-size: 24px;
    line-height: 24px;
    color: black;
`

const Icon = styled('div')`
    height: 64px;
    width: 64px;

    background-image: url(/logo/backpack.svg);
    background-repeat: no-repeat;
    background-size: cover;

    border-radius: 10px;
`

export default function Logo() {
    return <Container><Icon /><Name>Wander<br/>Garden</Name></Container>
}

