import { styled } from 'goober'

const Circle = styled('div')`
    display: flex;
    height: 120px;
    width: 120px;
    background-color: black;
    border-radius: 80px;
    font-size: 32px;
    color: white;
    align-items: center;
    justify-content: center;
    font-family: Courier;
    font-weight: bold;
    border-style: double;
    border-width: 20px;

    background: linear-gradient(-45deg, #0d3b17, #0d3b39, #0d183b, #1d0d3b);
    animation: gradient 6s ease infinite;
    background-size: 400% 400%;
`

export default function Logo() {
    return <Circle>2B</Circle>
}