import Page from "components/Page"
import { useSetTitle, useTitle } from "domain/timeline"
import Modal from "components/Modal"
import TextField from "components/TextField"
import Button from "components/Button"
import { titleFromLocationHighlights } from "domain/timeline/groups"
import { styled } from "goober"
import { EventType } from "domain/timeline/types"
import Separator from "components/Separator"
import type { TripGroup } from "domain/timeline/types"

const Stats = styled('div')`
    display: flex;
    flex: 1;
    flex-direction: row;
    min-width: 600px;
`

const Options = styled('div')`
    display: flex;
    flex: 1;
    flex-direction: column;
    margin-top: 22px;
    margin-bottom: 22px;
`

export type GroupMoreModalProps = {
    group: TripGroup,
    onClickAway: ()=>void,
}

export default function GroupMoreModal({ group, onClickAway }: GroupMoreModalProps) {
    const locationTitle = titleFromLocationHighlights(group.highlights)
    const title = useTitle(group.id)
    const saveTitle = useSetTitle(group.id)
    const onSaveTitle = (event: Event) => event.target && saveTitle((event.target as HTMLTextAreaElement).value)

    const checkinsLength = group.events.filter(e => e.type === EventType.Checkin).length

    return (
        <Modal isOpen onClickAway={onClickAway}>
            <Page header={locationTitle}>
                <Stats>
                    <Button>{group.events.length} events</Button>
                    <Separator />
                    <Button>{checkinsLength} checkins</Button>
                </Stats>
                <Options>
                    <TextField placeholder="Trip title" defaultValue={title} onBlur={onSaveTitle}/>
                </Options>
            </Page>
        </Modal>
    )
}