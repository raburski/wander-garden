import { styled } from "goober"
import BackButton from "./BackButton"
import Header from "./Header"
import { motion } from 'framer-motion'

const NON_MODAL_PAGE_STYLE_DEFAULT = `
    padding-left: 0px;
    padding-right: 12px;
`

const NON_MODAL_PAGE_STYLE_LARGE = `
    padding-top: 48px;
`

const Separator = styled('div')`
    display: flex;
    flex: 1;
    @media only screen and (max-width: ${props => props.theme.breakpoints.small}px) {
        display: none;
    }
`

const Container = styled(motion.div)`
    display: flex;
    flex: 1;
    flex-direction: column;
    padding-top: 32px;
    padding-left: 24px;
    padding-right: 24px;
    max-width: 1200px;
    min-width: 312px;

    @media only screen and (max-width: ${props => props.theme.breakpoints.medium}px) {
        ${props => props.isModal ? '' : NON_MODAL_PAGE_STYLE_DEFAULT}
    }

    @media only screen and (min-width: ${props => props.theme.breakpoints.large}px) {
        padding-left: 32px;
        padding-right: 48px;
        ${props => props.isModal ? '' : NON_MODAL_PAGE_STYLE_LARGE}
    }

    @media only screen and (max-width: ${props => props.theme.breakpoints.small}px) {
        padding-top: 22px;
        padding-left: 12px;
    }
`

export default function Page({ children, header, showBackButton = false, right = null, onBack = null, ...props }) {
    return (
        <Container {...props}>
            <Header>{(showBackButton || onBack) ? <BackButton onClick={onBack} /> : null}{header}<Separator />{right}</Header>
            {children}
        </Container>
    )
}
