import { styled } from "goober"
import BackButton from "./BackButton"

const Container = styled('div')`
    display: flex;
    flex: 1;
    flex-direction: column;
    padding-top: 32px;
    padding-left: 24px;
    padding-right: 24px;
    padding-bottom: 16px;
    max-width: 1200px;
    min-width: 312px;
`

const Header = styled('h1')`
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    border-bottom: 3px solid #4fa177;
    font-size: 38px;
    font-weight: 800;
    font-family: Header;
    padding-left: 2px;
    padding-bottom: 4px;
    margin-bottom: 18px;
    margin-top: -4px;
    color: ${props => props.theme.text};
`

const Separator = styled('div')`
    display: flex;
    flex: 1;
`

export default function Page({ children, header, showBackButton = false, right = null, ...props }) {
    return <Container {...props}><Header>{showBackButton ? <BackButton /> : null}{header}<Separator />{right}</Header>{children}</Container>
}
