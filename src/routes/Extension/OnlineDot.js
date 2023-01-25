import { styled } from 'goober'

export default styled('div')`
    display: flex;
    align-self: center;

    width: 10px;
    height: 10px;
    background-color: green;
    border-radius: 5px;
    margin-left: 10px;

    animation-name: pulse;
    animation-duration: 1.2s;
    animation-timing-function: ease-out;
    animation-direction: alternate;
    animation-iteration-count: infinite;
    animation-play-state: running;

    @keyframes pulse {
        0% { opacity: 100%; scale: 100%; }
        100% { opacity: 30%; scale: 90%; }
    }
`