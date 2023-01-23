import { Routes, Route, Navigate } from "react-router"
import Swarm from './Swarm'
import Events from './Events'
import Netflix from './Netflix'
import Context from "./Context"
import Timeline from './Timeline'
import Badges from './Badges'
import Dashboard from './Dashboard'
import Phone from './Phone'
import PhoneConnect from './PhoneConnect'
import AuthenticationFinish from './AuthenticationFinish'
import WebsiteInfo from "./WebsiteInfo"
import Map from './Map'

export default function AllRoutes() {
    return (
    <Routes>
        <Route path="swarm" element={<Swarm />}/>
        <Route path="auth" element={<AuthenticationFinish />}/>
        <Route path="netflix" element={<Netflix />}/>
        <Route path="phone" element={<Phone />}/>
        <Route path="phone-connect" element={<PhoneConnect />}/>
        <Route path="timeline" element={<Timeline />}/>
        <Route path="badges" element={<Badges />}/>
        <Route path="events" element={<Events />}/>
        <Route path="context" element={<Context />}/>
        <Route path="map" element={<Map />}/>
        <Route path="info" element={<WebsiteInfo />}/>
        <Route path="/" element={<Dashboard />}/>
        <Route path="*" element={<Navigate to="/" />}/>
    </Routes>
    )
}