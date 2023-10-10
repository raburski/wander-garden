import { Wrapper as GoogleMapsWrapper } from "@googlemaps/react-wrapper"

export default function GoogleMapsProvider({ children }) {
    return (
        <GoogleMapsWrapper apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} libraries={["places", "maps"]}>
            {children}
        </GoogleMapsWrapper>
    )
}