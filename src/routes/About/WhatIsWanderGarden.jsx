import InfoPanel from '../../components/InfoPanel'
import SquareImage from '../../components/SquareImage'

const COPY = `Wander Garden is a simple web-app that helps you make sense of your travel history. We connect to various data sources and present them in a cohesive form.

All your data is stored solely in your browser. There are no databases and backend servers for the garden. It lives in your backyard and is yours to take care of. No data ever lands in hands of any third parties this way. You can backup and restore it from files on your local disk.

`

export default function WhatIsWanderGarden() {
    return (
        <InfoPanel
            spacing
            header="What is Wander Garden?"
            image={<SquareImage size={260} src="/3d/backpackgarden.png"/>}
        >
            {COPY}
        </InfoPanel>
    )
}