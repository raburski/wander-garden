import InfoPanel from "./InfoPanel"
import SquareImage from "./SquareImage"

export default function ErrorFallback({ error }) {
    console.log('err', error)
    const text = `Something went wrong...
You may have just discovered a bug.
Try refresing the page and if it happens again please report it on our discord 🙏🏻

${error}
    `
    return (
        <InfoPanel
            spacing
            image={<SquareImage src="/3d/forestfire.png" size={180}/>}
            title="Oupsssie..."
            text={text}
        />
    )
}