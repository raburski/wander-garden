import { styled } from "goober"

const Container = styled('div')`
    display: flex;
    flex: 1;
    flex-direction: column;
    padding-top: 32px;
    padding-left: 32px;
    padding-right: 32px;
    padding-bottom: 16px;
    max-width: 1224px;
`

const Header = styled('h1')`
    border-bottom: 5px solid #85B89Eff;
    font-size: 26px;
    font-weight: 800;
    padding-bottom: 8px;
    margin-bottom: 32px;
    margin-top: -4px;
`

export default function Page({ children, header, ...props }) {
    return <Container {...props}><Header>{header}</Header>{children}</Container>
}
