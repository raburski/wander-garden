import { styled } from "goober"

const Container = styled('div')`
    display: flex;
    flex: 1;
    flex-direction: column;
    padding-top: 32px;
    padding-left: 24px;
    padding-right: 24px;
    padding-bottom: 16px;
    max-width: 1040px;
`

const Header = styled('h1')`
    border-bottom: 3px solid #4fa177;
    font-size: 38px;
    font-weight: 800;
    font-family: Header;
    padding-left: 2px;
    padding-bottom: 4px;
    margin-bottom: 18px;
    margin-top: -4px;
`

export default function Page({ children, header, ...props }) {
    return <Container {...props}><Header>{header}</Header>{children}</Container>
}
