import Button from 'components/Button'
import ModalPage from 'components/ModalPage'
import { styled } from 'goober'
import { useFetchSwarm } from 'domain/swarm/hooks'
import { TbRefresh } from 'react-icons/tb'
import toast from 'react-hot-toast'
import { useLastUpdated } from 'domain/swarm'
import moment from 'moment'

const Logo = styled('img')`
    width: 112px;
    height: 112px;
    padding: 6px;
    margin-top: 22px;
    align-self: center;
`

const StartButton = styled(Button)`
    margin-top: 32px;
    font-size: 18px;
    align-self: center;
    padding: .85rem 1.0rem;
`

const UpdateCopy = styled('div')`
    margin-top: 42px;
    font-weight: bold;
    text-align: center;
    color: ${props => props.theme.text};
`

export default function StartSwarmUpdateModal({ onCancel, ...props }) {
    const [fetching, fetchCheckins] = useFetchSwarm()
    const [lastUpdated] = useLastUpdated()

    const text = lastUpdated ? `Last updated on ${moment(lastUpdated).format('DD/MM/YYYY')}` : 'First update may take a while...'

    async function onStartUpdate() {
        try {
            await fetchCheckins()
            toast.success('List updated sucessfully!')
        } catch (e) {
            console.log('fetch checkins error', e)
        }
        onCancel()
    }

    return (
        <ModalPage header="Swarm checkins" onClickAway={fetching ? undefined : onCancel} pageStyle={{minWidth:342, marginBottom: 42}} {...props}>
            <Logo src="/logo/swarm.svg"/>
            <UpdateCopy>{text}</UpdateCopy>
            <StartButton icon={TbRefresh} onClick={onStartUpdate} disabled={fetching}>{fetching ? 'Fetching checkins...' : 'Update now'}</StartButton>
        </ModalPage>
    )
}
