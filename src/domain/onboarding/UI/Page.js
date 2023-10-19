import Page from "components/Page";
import { styled } from "goober";

const Container = styled('div')`
    display: flex;
    flex: 1;
    justify-content: center;
`

export default function OnboardingPage({ children, ...props }) {
    return (
        <Container>
            <Page {...props} style={{maxWidth: 600, minHeight: 400, marginTop: '10%'}}>
                {children}
            </Page>
        </Container>
    )
}