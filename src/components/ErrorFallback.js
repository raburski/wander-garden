import InfoPanel from "./InfoPanel"

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
            title="Oupsssie..."
            text={text}
        />
    )
}